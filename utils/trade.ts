import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";
import { ethers } from "ethers";
import { SWAP_ROUTER_ABI } from "@/config/SwapRouter";
import { concat, numberToHex, size } from "viem";
import { normalizeAmount, structureError } from "./helpers";
import { approveERC20ForSwap, approveERC20ForUniswap } from "./approvals";
import { config } from "@/lib/appwrite";

const UNISWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Mainnet V3
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NATIVE_ADDRESSES = {
  SOL: "So11111111111111111111111111111111111111112",
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
};

export const USDT_ADDRESSES = {
  SOL: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  ETH: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

export async function swapWithJupiter(
  connection: Connection,
  tokenAMint: string,
  tokenBMint: string,
  amount: string,
  privateKey: string
) {
  const SIGNER_ACCOUNT = {
    relay: config.jupiterRelay,
    fBps: 100,
    fShareBps: 10000,
  };
  if (!SIGNER_ACCOUNT.relay) {
    throw new Error("SIGNER_RELAY is not set in environment variables");
  }

  const decoded = Buffer.from(privateKey, "base64");

  const wallet = Keypair.fromSecretKey(new Uint8Array(decoded));

  if (!wallet) {
    throw new Error("Wallet not found");
  }
  if (!connection) {
    throw new Error("Connection not found");
  }
  if (!tokenAMint || !tokenBMint) {
    throw new Error("Token mint addresses not found");
  }
  if (!amount) {
    throw new Error("Amount not found");
  }
  if (!privateKey) {
    throw new Error("Private key not found");
  }
  // Step 1: Get swap quote with 1% fee
  const quoteResponse = await quoteWithJupiter(tokenAMint, tokenBMint, amount);
  if (quoteResponse.error) {
    throw new Error("Failed to get swap quote");
  }
  if (!quoteResponse) {
    throw new Error("No swap quote data");
  }

  // get serialized transactions for the swap

  const swapTransaction = await axios.post(
    "https://quote-api.jup.ag/v6/swap",
    {
      quoteResponse,
      userPublicKey: "HYe4vSaEGqQKnDrxWDrk3o5H2gznv7qtij5G6NNG8WHd", // wallet.publicKey,
      feeAccount: SIGNER_ACCOUNT.relay,
      feeBps: SIGNER_ACCOUNT.fBps,
      feeShareBps: SIGNER_ACCOUNT.fShareBps,
      referralAccount: SIGNER_ACCOUNT.relay,
      wrapAndUnwrapSol: true,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  // deserialize the transaction
  const swapTransactionBuf = Buffer.from(
    swapTransaction.data.swapTransaction,
    "base64"
  );
  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // sign the transaction
  transaction.sign([wallet]);

  // get the latest block hash
  const latestBlockHash = await connection.getLatestBlockhash();

  // Execute the transaction
  const rawTransaction = transaction.serialize();
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 2,
  });
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txid,
  });

  return txid;
}

export async function quoteWithJupiter(
  tokenAMint: string,
  tokenBMint: string,
  amount: string
) {
  const SIGNER_ACCOUNT = {
    relay: config.jupiterRelay,
    fBps: 100,
    fShareBps: 10000,
  };
  if (!SIGNER_ACCOUNT.relay) {
    throw new Error("SIGNER_RELAY is not set in environment variables");
  }

  try {
    const quoteResponse = await axios.get(
      `https://quote-api.jup.ag/v6/quote?inputMint=${tokenAMint}&outputMint=${tokenBMint}&amount=${amount}&slippageBps=50&feeBps=100`
    );

    return quoteResponse.data;
  } catch (error) {
    console.error("Swap failed:", error);
    return { error: error };
  }
}

export async function swapWithUniswap(
  provider,
  wallet,
  fromTokenAddress,
  toTokenAddress,
  amount
) {
  const signerAddress = wallet.address || wallet.publicKey.toString();
  const slippage = 0.5;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins

  try {
    const path = encodePath([fromTokenAddress, toTokenAddress], [3000]);
    const amountOutMinimum = calculateAmountOutMinimum(amount, slippage);

    const iface = new ethers.Interface(SWAP_ROUTER_ABI);
    const data = iface.encodeFunctionData("exactInput", [
      {
        path,
        recipient: signerAddress,
        deadline,
        amountIn: amount,
        amountOutMinimum: amountOutMinimum.toString(),
      },
    ]);

    const tx = {
      from: signerAddress,
      to: UNISWAP_ROUTER_ADDRESS,
      data,
      value: fromTokenAddress === ETH_ADDRESS ? amount : "0x0",
      gas: "0x0", // Gas will be estimated
    };

    const gasEstimate = await provider.request({
      method: "eth_estimateGas",
      params: [tx],
    });

    tx.gas = gasEstimate;

    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    const receipt = await waitForTransaction(provider, txHash);
    console.log("Uniswap V3 swap confirmed:", txHash);
    return txHash;
  } catch (error) {
    console.error("Uniswap V3 swap failed:", error);
    throw error;
  }
}

export const getQuote = async ({ client, sellToken, buyToken, amount }) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "0x-api-key": process.env.ZERO_EX_API_KEY,
      "0x-version": "v2",
    };

    const priceParams = new URLSearchParams({
      chainId: client.chain.id.toString(),
      sellToken,
      buyToken,
      sellAmount: amount.toString(),
      taker: client.account.address,
    });

    const res = await axios.get(
      "https://api.0x.org/swap/permit2/price?" + priceParams.toString(),
      {
        headers,
      }
    );
    const price = await res.data;
    return price;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const executeSwap = async ({ client, price, sellToken, buyToken }) => {
  const headers = {
    "Content-Type": "application/json",
    "0x-api-key": process.env.ZERO_EX_API_KEY,
    "0x-version": "v2",
  };

  const quoteParams = new URLSearchParams({
    chainId: client.chain.id.toString(),
    sellToken,
    buyToken,
    sellAmount: price.sellAmount,
    taker: client.account.address,
  });

  const res = await axios.get(
    "https://api.0x.org/swap/permit2/quote?" + quoteParams.toString(),
    { headers }
  );
  const quote = await res.data;

  if (!quote.permit2?.eip712)
    throw new Error("Missing EIP712 data for Permit2");
  const signature = await client.signTypedData(quote.permit2.eip712);

  const sigLengthHex = numberToHex(size(signature), {
    signed: false,
    size: 32,
  });
  quote.transaction.data = concat([
    quote.transaction.data,
    sigLengthHex,
    signature,
  ]);

  const nonce = await client.getTransactionCount({
    address: client.account.address,
  });

  const signedTransaction = await client.signTransaction({
    account: client.account,
    chain: client.chain,
    gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
    to: quote.transaction.to,
    data: quote.transaction.data,
    value: quote.transaction.value
      ? BigInt(quote.transaction.value)
      : undefined,
    gasPrice: quote.transaction.gasPrice
      ? BigInt(quote.transaction.gasPrice)
      : undefined,
    nonce,
  });

  const hash = await client.sendRawTransaction({
    serializedTransaction: signedTransaction,
  });
  return hash;
};

const swapToUsdt = async ({
  tokenSymbol,
  tokenAddress,
  amount,
  connection,
  wallet,
  ethereumProvider,
  chainId = 1, // Default: Ethereum mainnet
}) => {
  try {
    const isEthereum =
      tokenSymbol?.toUpperCase() === "ETH" ||
      (tokenAddress && tokenAddress.startsWith("0x"));

    const isSolana =
      tokenSymbol?.toUpperCase() === "SOL" ||
      (tokenAddress && !tokenAddress.startsWith("0x"));

    const normalizedAmount = normalizeAmount(amount); // Handles string, number, BN

    // --- SOLANA SWAP ---
    if (isSolana) {
      if (!connection) throw new Error("Solana connection required");
      if (!wallet) throw new Error("Solana wallet required");

      const sourceTokenAddress =
        tokenSymbol?.toUpperCase() === "SOL"
          ? NATIVE_ADDRESSES.SOL
          : tokenAddress;

      if (!sourceTokenAddress)
        throw new Error("Missing token address for Solana swap");

      console.log(
        `Swapping ${normalizedAmount} ${tokenSymbol || "token"} on Solana → USDT`
      );

      return await swapWithJupiter(
        connection,
        sourceTokenAddress,
        USDT_ADDRESSES.SOL,
        normalizedAmount,
        wallet
      );
    }

    // --- ETHEREUM SWAP ---
    if (isEthereum) {
      if (!ethereumProvider) throw new Error("Ethereum provider required");
      if (!wallet) throw new Error("Ethereum wallet required");

      let needsApproval = false;
      const sourceTokenAddress =
        tokenSymbol?.toUpperCase() === "ETH"
          ? NATIVE_ADDRESSES.ETH
          : tokenAddress;

      if (!sourceTokenAddress)
        throw new Error("Missing token address for Ethereum swap");

      if (tokenSymbol?.toUpperCase() !== "ETH") needsApproval = true;

      console.log(
        `Swapping ${normalizedAmount} ${tokenSymbol || "token"} on Ethereum → USDT`
      );

      if (needsApproval) {
        console.log("Approving token for 1inch...");
        await approveERC20ForSwap(
          ethereumProvider,
          wallet,
          sourceTokenAddress,
          normalizedAmount,
          chainId
        );
      }

      try {
        // return await swapWithOneInch(
        //   ethereumProvider,
        //   wallet,
        //   sourceTokenAddress,
        //   USDT_ADDRESSES.ETH,
        //   normalizedAmount,
        //   chainId
        // );
      } catch (aggregatorError) {
        console.warn("1inch swap failed, trying Uniswap...", aggregatorError);

        if (needsApproval) {
          console.log("Re-approving token for Uniswap...");
          await approveERC20ForUniswap(
            ethereumProvider,
            wallet,
            sourceTokenAddress,
            normalizedAmount
          );
        }

        return await swapWithUniswap(
          ethereumProvider,
          wallet,
          sourceTokenAddress,
          USDT_ADDRESSES.ETH,
          normalizedAmount
        );
      }
    }

    throw new Error("Unsupported chain or token format");
  } catch (error) {
    console.error("Swap to USDT failed:", error);
    return { error: structureError(error) };
  }
};

// const client = createWalletClient({
//   account: privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`),
//   chain: base,
//   transport: http(ALCHEMY_HTTP_TRANSPORT_URL),
// }).extend(publicActions);

export { swapToUsdt };
