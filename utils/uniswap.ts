import { ethers, BigNumber } from "ethers";
import {
  Token as V3Token,
  CurrencyAmount,
  TradeType as V3TradeType,
  Percent,
} from "@uniswap/sdk-core";
import { Pool, Route as V3Route, Trade as V3Trade } from "@uniswap/v3-sdk";
import {
  Token as V2Token,
  Pair as V2Pair,
  Route as V2Route,
  Trade as V2Trade,
  TradeType as V2TradeType,
  Fetcher as V2Fetcher,
  CurrencyAmount as V2CurrencyAmount,
} from "@uniswap/sdk";
import { abi as ERC20_ABI } from "@uniswap/v2-core/build/ERC20.json";
import SWAP_ROUTER_V3_ABI from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import JSBI from "jsbi";

// ——— Constants ———
const CHAIN_ID = 1;
const FACTORY_V3 = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const QUOTER_V3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const ROUTER_V3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const ROUTER_V2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const FEE_TIERS = [500, 3000, 10000]; // 0.05%, 0.3%, 1%

// ——— Types ———
export interface Quote {
  source: "V3" | "V2";
  amountOut: BigNumber;
  feeTier?: number; // only for V3
}

// ——— Helpers ———
// 1) Fetch and build a V3 Pool instance
async function fetchV3Pool(
  tokenA: V3Token,
  tokenB: V3Token,
  fee: number,
  provider: ethers.JsonRpcProvider
): Promise<Pool | null> {
  const factory = new ethers.Contract(
    FACTORY_V3,
    ["function getPool(address,address,uint24) view returns (address)"],
    provider
  );
  const poolAddress: string = await factory.getPool(
    tokenA.address,
    tokenB.address,
    fee
  );
  if (poolAddress === ethers.ZeroAddress) return null;

  const poolContract = new ethers.Contract(
    poolAddress,
    [
      "function liquidity() view returns (uint128)",
      "function slot0() view returns (uint160 sqrtPriceX96,int24 tick,*,*,*,*)",
    ],
    provider
  );
  const [liquidity, slot0] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return new Pool(
    tokenA,
    tokenB,
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    slot0.tick
  );
}

// 2) Try all V3 fee tiers, build trades, pick best
async function tryV3Trades(
  tokenIn: V3Token,
  tokenOut: V3Token,
  amountIn: BigNumber,
  provider: ethers.JsonRpcProvider
): Promise<{
  trade: V3Trade<V3Token, V3Token, V3TradeType>;
  fee: number;
} | null> {
  const results: Array<{
    trade: V3Trade<V3Token, V3Token, V3TradeType>;
    fee: number;
  }> = [];

  for (const fee of FEE_TIERS) {
    try {
      const pool = await fetchV3Pool(tokenIn, tokenOut, fee, provider);
      if (!pool) continue;
      const route = new V3Route([pool], tokenIn, tokenOut);
      const trade = await V3Trade.fromRoute(
        route,
        CurrencyAmount.fromRawAmount(tokenIn.wrapped, amountIn.toString()),
        V3TradeType.EXACT_INPUT
      );
      results.push({ trade, fee });
    } catch {
      continue;
    }
  }
  if (results.length === 0) return null;
  // pick highest output

  results.sort((a, b) =>
    JSBI.greaterThan(
      b.trade.outputAmount.quotient,
      a.trade.outputAmount.quotient
    )
      ? 1
      : -1
  );
  return results[0];
}

// 3) Try V2
async function tryV2Trade(
  tokenIn: V2Token,
  tokenOut: V2Token,
  amountIn: BigNumber,
  provider: ethers.JsonRpcProvider
): Promise<V2Trade> {
  const pair = await V2Fetcher.fetchPairData(tokenIn, tokenOut, provider);
  const route = new V2Route([pair], tokenIn);
  const amount = new V2CurrencyAmount(tokenIn, amountIn.toString());

  return new V2Trade(route, amount, V2TradeType.EXACT_INPUT);
}

// 4) Ensure ERC20 approval
async function ensureApproval(
  tokenAddr: string,
  spender: string,
  amount: BigNumber,
  signer: ethers.Signer
) {
  const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
  const allowance: BigNumber = await token.allowance(
    await signer.getAddress(),
    spender
  );
  if (allowance.lt(amount)) {
    const tx = await token.approve(spender, ethers.MaxUint256);
    await tx.wait();
  }
}

// ——— Public: getBestQuote ———
export async function getBestQuote(
  tokenInAddr: string,
  tokenOutAddr: string,
  amountInStr: string, // e.g. "100.0"
  provider: ethers.JsonRpcProvider
): Promise<Quote> {
  const amountIn = ethers.parseUnits(
    amountInStr,
    await (async () => {
      // quick ERC20 lookup for decimals
      const erc = new ethers.Contract(tokenInAddr, ERC20_ABI, provider);
      return (await erc.decimals()) as number;
    })()
  );

  // wrap tokens for SDKs
  const tokenInV3 = new V3Token(
    CHAIN_ID,
    tokenInAddr,
    await (async () => {
      const erc = new ethers.Contract(tokenInAddr, ERC20_ABI, provider);
      return (await erc.decimals()) as number;
    })(),
    "",
    ""
  );
  const tokenOutV3 = new V3Token(
    CHAIN_ID,
    tokenOutAddr,
    await (async () => {
      const erc = new ethers.Contract(tokenOutAddr, ERC20_ABI, provider);
      return (await erc.decimals()) as number;
    })(),
    "",
    ""
  );

  // 1) Try V3
  const bestV3 = await tryV3Trades(tokenInV3, tokenOutV3, amountIn, provider);
  if (bestV3) {
    return {
      source: "V3",
      amountOut: BigNumber.from(bestV3.trade.outputAmount.quotient.toString()),
      feeTier: bestV3.fee,
    };
  }

  // 2) Fallback to V2
  const tokenInV2 = new V2Token(CHAIN_ID, tokenInAddr, tokenInV3.decimals);
  const tokenOutV2 = new V2Token(CHAIN_ID, tokenOutAddr, tokenOutV3.decimals);
  const tradeV2 = await tryV2Trade(tokenInV2, tokenOutV2, amountIn, provider);

  return {
    source: "V2",
    amountOut: BigNumber.from(tradeV2.outputAmount.quotient.toString()),
  };
}

// ——— Public: executeSwap ———
export async function executeSwap(
  tokenInAddr: string,
  tokenOutAddr: string,
  amountInStr: string,
  signer: ethers.Signer,
  slippageBips = 50
): Promise<ethers.TransactionResponse> {
  const provider = signer.provider as ethers.JsonRpcProvider;
  const decimalsIn = await new ethers.Contract(
    tokenInAddr,
    ERC20_ABI,
    provider
  ).decimals();
  const decimalsOut = await new ethers.Contract(
    tokenOutAddr,
    ERC20_ABI,
    provider
  ).decimals();
  const amountIn = ethers.parseUnits(amountInStr, decimalsIn);

  // wrap tokens
  const tokenInV3 = new V3Token(CHAIN_ID, tokenInAddr, decimalsIn);
  const tokenOutV3 = new V3Token(CHAIN_ID, tokenOutAddr, decimalsOut);
  let useV3 = true;
  let v3info = await tryV3Trades(tokenInV3, tokenOutV3, amountIn, provider);

  // if no V3, fallback
  if (!v3info) useV3 = false;

  // prepare slippage tolerance
  const slippagePct = new Percent(slippageBips, 10_000); // bips to percent

  if (useV3 && v3info) {
    const { trade, fee } = v3info;
    const amountOutMin = trade
      .minimumAmountOut(slippagePct)
      .quotient.toString();

    // simulate
    const routerV3 = new ethers.Contract(
      ROUTER_V3,
      SWAP_ROUTER_V3_ABI.abi,
      provider
    );
    await routerV3.callStati.exactInputSingle({
      tokenIn: tokenInAddr,
      tokenOut: tokenOutAddr,
      fee,
      recipient: await signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 1800,
      amountIn: trade.inputAmount.quotient.toString(),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0,
    });

    // approval + execute
    await ensureApproval(tokenInAddr, ROUTER_V3, amountIn, signer);
    return routerV3.connect(signer).exactInputSingle({
      tokenIn: tokenInAddr,
      tokenOut: tokenOutAddr,
      fee,
      recipient: await signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 1800,
      amountIn: trade.inputAmount.quotient.toString(),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0,
    });
  } else {
    // V2 path
    const tokenInV2 = new V2Token(CHAIN_ID, tokenInAddr, decimalsIn);
    const tokenOutV2 = new V2Token(CHAIN_ID, tokenOutAddr, decimalsOut);
    const tradeV2 = await tryV2Trade(tokenInV2, tokenOutV2, amountIn, provider);
    const amountOutMin = ethers.parseUnits(
      tradeV2.minimumAmountOut(slippagePct).toExact(),
      decimalsOut
    );

    const routerV2 = new ethers.Contract(
      ROUTER_V2,
      [
        "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
      ],
      signer
    );

    // simulate
    await routerV2.callStatic.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      [tokenInAddr, tokenOutAddr],
      await signer.getAddress(),
      Math.floor(Date.now() / 1000) + 1800
    );

    // approval + execute
    await ensureApproval(tokenInAddr, ROUTER_V2, amountIn, signer);
    return routerV2.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      [tokenInAddr, tokenOutAddr],
      await signer.getAddress(),
      Math.floor(Date.now() / 1000) + 1800
    );
  }
}
