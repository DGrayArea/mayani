import { exchangeProxyAbi } from "@/config";
import { config } from "@/lib/appwrite";
import axios from "axios";
import { ethers } from "ethers";
import {
  createWalletClient,
  erc20Abi,
  getContract,
  maxUint256,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { http } from "viem";

async function waitForTransaction(provider, txHash): Promise<any> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });

        if (receipt && receipt.status === "0x1") {
          clearInterval(interval);
          resolve(receipt);
        } else if (receipt && receipt.status === "0x0") {
          clearInterval(interval);
          reject(new Error("Transaction failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 3000); // check every 3s
  });
}

interface GetQuoteParams {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string; // in base units (e.g., wei for ETH)
  taker: string;
}

interface GetPriceParams {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string; // in base units (e.g., wei for ETH)
  taker: string;
}

async function get0xPermit2Quote(params: GetQuoteParams) {
  try {
    const queryParams = {
      chainId: params.chainId,
      sellToken: params.sellToken,
      buyToken: params.buyToken,
      sellAmount: params.sellAmount,
      taker: params.taker,
    };

    const response = await axios.get("https://api.0x.org/swap/permit2/quote", {
      params: {
        ...queryParams,
        swapFeeRecipient: config.zeroExRelay,
        swapFeeBps: 500,
        swapFeeToken: params.buyToken || params.sellToken,
        tradeSurplusRecipient: config.zeroExRelay,
      },
      headers: {
        "0x-api-key": config.zeroExApiKey,
        "0x-version": "v2",
      },
    });

    return { quote: response.data, err: false };
  } catch (err: any) {
    console.log("Failed to fetch 0x quote:", err);
    return {
      error: true,
      err,
    };
  }
}

async function get0xPermit2Price(params: GetPriceParams) {
  try {
    const queryParams = {
      chainId: params.chainId,
      sellToken: params.sellToken,
      buyToken: params.buyToken,
      sellAmount: params.sellAmount,
      taker: params.taker,
    };

    const response = await axios.get("https://api.0x.org/swap/permit2/price?", {
      params: {
        ...queryParams,
        swapFeeRecipient: config.zeroExRelay,
        swapFeeBps: 500,
        swapFeeToken: params.buyToken || params.sellToken,
        tradeSurplusRecipient: config.zeroExRelay,
      },
      headers: {
        "0x-api-key": config.zeroExApiKey,
        "0x-version": "v2",
      },
    });

    return { quote: response.data, err: false };
  } catch (err: any) {
    console.log("Failed to fetch 0x quote:", err);
    return {
      error: true,
      err,
    };
  }
}

async function get0xPermit2Approve(
  privateKey: any,
  sellString: string,
  sellAddress: any
) {
  const client = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: mainnet,
    transport: http(config.alchemyTransport),
  }).extend(publicActions);

  const Permit2 = getContract({
    address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    abi: exchangeProxyAbi,
    client,
  });
  const token = getContract({
    address: sellAddress,
    abi: erc20Abi,
    client,
  });

  const sellAmount = ethers.parseUnits(sellString, await token.read.decimals());

  // Check allowance is enough for Permit2 to spend sellToken
  if (
    sellAmount >
    (await token.read.allowance([client.account.address, Permit2.address]))
  )
    try {
      const { request } = await token.simulate.approve([
        Permit2.address,
        maxUint256,
      ]);
      const hash = await token.write.approve(request.args);

      await client.waitForTransactionReceipt({ hash });

      return { error: false, hash };
    } catch (error) {
      console.log("Error approving Permit2:", error);
    }
  else {
    console.log("USDC already approved for Permit2");
  }
}

async function get0xPermit2Swap(
  sellToken,
  buyToken,
  sellAmount,
  taker,
  privateKey: any
) {
  try {
    const quote = await get0xPermit2Quote({
      chainId: 1,
      sellToken,
      buyToken,
      sellAmount,
      taker,
    });

    const client = createWalletClient({
      account: privateKeyToAccount(privateKey),
      chain: mainnet,
      transport: http(config.alchemyTransport),
    }).extend(publicActions);

    const hash = await client.sendTransaction({
      to: quote.quote.to,
      data: quote.quote.data,
    });

    await client.waitForTransactionReceipt({ hash });

    return { error: false, quote, hash: hash };
  } catch (error) {
    console.log("Error Swapping Permit2:", error);
  }
}

export {
  waitForTransaction,
  get0xPermit2Quote,
  get0xPermit2Price,
  get0xPermit2Approve,
  get0xPermit2Swap,
};
