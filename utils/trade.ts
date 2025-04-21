import { JUPITER_API_URL, ONE_INCH_API_URL } from "@/config";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import axios from "axios";
import { ethers } from "ethers";
import { SWAP_ROUTER_ABI } from "@/config/SwapRouter";

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

export function normalizeAmount(amount: number | string, decimals = 18): any {
  return ethers.parseUnits(amount.toString(), decimals);
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delay = 1000
): Promise<T> {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

export function structureError(error: any) {
  return {
    success: false,
    error: error?.message || error?.toString() || "Unknown error",
  };
}

const buyToken = async (
  tokenIn: string,
  amount: number,
  tokenOut: string,
  chain: "eth" | "sol",
  decimals: number,
  fee: number
) => {
  if (chain === "eth") {
    // 1inch API for Ethereum
    const url = `${ONE_INCH_API_URL}/1/swap?fromTokenAddress=${tokenOut}&toTokenAddress=${tokenIn}&amount=${amount * 10 ** decimals}&fromAddress=YOUR_WALLET_ADDRESS&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  } else if (chain === "sol") {
    // Jupiter API for Solana
    const url = `${JUPITER_API_URL}/quote?inputMint=${tokenOut}&outputMint=${tokenIn}&amount=${amount * 10 ** decimals}&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  }
};

const sellToken = async (
  tokenIn: string,
  amount: number,
  tokenOut: string,
  chain: "eth" | "sol",
  decimals: number,
  fee: number
) => {
  if (chain === "eth") {
    // 1inch API for Ethereum
    const url = `${ONE_INCH_API_URL}/1/swap?fromTokenAddress=${tokenIn}&toTokenAddress=${tokenOut}&amount=${amount * 10 ** decimals}&fromAddress=YOUR_WALLET_ADDRESS&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  } else if (chain === "sol") {
    // Jupiter API for Solana
    const url = `${JUPITER_API_URL}/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount * 10 ** decimals}&slippage=1&fee=${fee}`;
    const response = await axios.get(url);
    return response.data;
  }
};

export async function swapWithJupiter(
  connection: Connection,
  tokenAMint: string,
  tokenBMint: string,
  amount: string,
  wallet: Keypair
) {
  const SIGNER_ACCOUNT = {
    pubkey: process.env.SIGNER_PUB_KEY,
    fBps: 100,
    fShareBps: 10000,
  };
  if (!SIGNER_ACCOUNT.pubkey) {
    throw new Error("SIGNER_PUB_KEY is not set in environment variables");
  }

  try {
    // Step 1: Get swap quote with 1% fee
    const quoteResponse = await axios.get(
      `https://api.jup.ag/v1/quote?inputMint=${tokenAMint}&outputMint=${tokenBMint}&amount=${amount}&slippageBps=50&feeBps=100`
    );

    const response = await quoteResponse.data;
    // Step 2: Prepare swap transaction
    const swapResponse = await axios.post(
      "https://api.jup.ag/v1/swap",
      {
        response,
        userPublicKey: wallet.publicKey,
        referralAccount: SIGNER_ACCOUNT.pubkey,
        feeBps: SIGNER_ACCOUNT.fBps,
        feeShareBps: SIGNER_ACCOUNT.fShareBps,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Execute swap
    const swapTransaction = Transaction.from(
      Buffer.from(swapResponse.data.swapTransaction, "base64")
    );
    // const signedTx = await swapTransaction.sign(wallet);
    // const txid = await connection.sendRawTransaction(signedTx.serialize());
    // const latestBlockhash = await connection.getLatestBlockhash("finalized");
    // await connection.confirmTransaction(
    //   {
    //     signature: signedTx,
    //     blockhash: latestBlockhash.blockhash,
    //     lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //   },
    //   "finalized"
    // );

    // return txid;

    swapTransaction.sign(wallet); // For Keypair
    const txid = await connection.sendRawTransaction(
      swapTransaction.serialize()
    );

    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    await connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "finalized"
    );

    return txid;
  } catch (error) {
    console.error("Swap failed:", error);
    return { error: error };
  }
}

/**
 * Swaps any token to USDT on either Ethereum or Solana
 * @param params.tokenSymbol - 'ETH', 'SOL' or custom token symbol
 * @param params.tokenAddress - Token address (required for custom tokens)
 * @param params.amount - Amount to swap in base units
 * @param params.connection - Solana connection (required for Solana swaps)
 * @param params.wallet - User wallet (required for both chains)
 * @param params.ethereumProvider - Ethereum provider (required for ETH swaps)
 * @param params.chainId - Ethereum chain ID (defaults to 1 for mainnet)
 * @returns Transaction ID or error object
 */
// const swapToUsdt = async ({
//   tokenSymbol,
//   tokenAddress,
//   amount,
//   connection,
//   wallet,
//   ethereumProvider,
//   chainId = 1, // Default to Ethereum mainnet
// }) => {
//   // USDT addresses on different chains
//   const USDT_ADDRESSES = {
//     SOL: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT on Solana
//     ETH: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum mainnet
//   };

//   // Native token addresses
//   const NATIVE_ADDRESSES = {
//     SOL: "So11111111111111111111111111111111111111112", // SOL
//     ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH (special address for 1inch)
//   };

//   try {
//     // Determine which blockchain we're using
//     const isEthereum =
//       tokenSymbol.toUpperCase() === "ETH" ||
//       (tokenAddress && tokenAddress.startsWith("0x"));
//     const isSolana =
//       tokenSymbol.toUpperCase() === "SOL" ||
//       (tokenAddress && !tokenAddress.startsWith("0x"));

//     // For Solana blockchain
//     if (isSolana) {
//       if (!connection)
//         throw new Error("Solana connection required for Solana swaps");
//       if (!wallet) throw new Error("Wallet required for Solana swaps");

//       let sourceTokenAddress;

//       // Determine source token address
//       if (tokenSymbol.toUpperCase() === "SOL") {
//         sourceTokenAddress = NATIVE_ADDRESSES.SOL;
//         console.log(`Swapping ${amount} SOL to USDT via Jupiter`);
//       } else if (tokenAddress) {
//         sourceTokenAddress = tokenAddress;
//         console.log(
//           `Swapping ${amount} ${tokenSymbol || "custom token"} (${tokenAddress}) to USDT via Jupiter`
//         );
//       } else {
//         throw new Error(
//           "Either tokenSymbol or tokenAddress must be provided for Solana swaps"
//         );
//       }

//       // Call the Jupiter swap function
//       return await swapWithJupiter(
//         connection,
//         sourceTokenAddress,
//         USDT_ADDRESSES.SOL,
//         amount,
//         wallet
//       );
//     }
//     // For Ethereum blockchain
//     else if (isEthereum) {
//       if (!ethereumProvider)
//         throw new Error("Ethereum provider required for Ethereum swaps");
//       if (!wallet) throw new Error("Wallet required for Ethereum swaps");

//       let sourceTokenAddress;
//       let needsApproval = false;

//       // Determine source token address
//       if (tokenSymbol.toUpperCase() === "ETH") {
//         sourceTokenAddress = NATIVE_ADDRESSES.ETH; // Use the special native ETH address for 1inch
//         console.log(`Swapping ${amount} ETH to USDT`);
//       } else if (tokenAddress) {
//         sourceTokenAddress = tokenAddress;
//         needsApproval = true; // ERC20 tokens need approval
//         console.log(
//           `Swapping ${amount} ${tokenSymbol || "custom token"} (${tokenAddress}) to USDT`
//         );
//       } else {
//         throw new Error(
//           "Either tokenSymbol or tokenAddress must be provided for Ethereum swaps"
//         );
//       }

//       try {
//         // Handle ERC20 approval if needed
//         if (needsApproval) {
//           console.log(`Approving ${tokenSymbol || "token"} for swap...`);
//           await approveERC20ForSwap(
//             ethereumProvider,
//             wallet,
//             sourceTokenAddress,
//             amount,
//             chainId
//           );
//         }

//         // Try 1Inch first (popular aggregator with good liquidity)
//         return await swapWithOneInch(
//           ethereumProvider,
//           wallet,
//           sourceTokenAddress,
//           USDT_ADDRESSES.ETH,
//           amount,
//           chainId
//         );
//       } catch (aggregatorError) {
//         console.log(
//           "1Inch swap failed, falling back to Uniswap:",
//           aggregatorError
//         );

//         // Handle ERC20 approval specifically for Uniswap if needed
//         if (needsApproval) {
//           console.log(`Re-approving ${tokenSymbol || "token"} for Uniswap...`);
//           await approveERC20ForUniswap(
//             ethereumProvider,
//             wallet,
//             sourceTokenAddress,
//             amount
//           );
//         }

//         // Fallback to Uniswap if 1Inch fails
//         return await swapWithUniswap(
//           ethereumProvider,
//           wallet,
//           sourceTokenAddress,
//           USDT_ADDRESSES.ETH,
//           amount
//         );
//       }
//     } else {
//       throw new Error(
//         `Unsupported token or chain. Please provide a valid token address or symbol.`
//       );
//     }
//   } catch (error) {
//     console.error(`Swap to USDT failed:`, error);
//     return { error: error.toString() };
//   }
// };

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
        return await swapWithOneInch(
          ethereumProvider,
          wallet,
          sourceTokenAddress,
          USDT_ADDRESSES.ETH,
          normalizedAmount,
          chainId
        );
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

/**
 * Approves an ERC20 token for use with 1inch
 * @param provider - Ethereum provider
 * @param wallet - User wallet
 * @param tokenAddress - ERC20 token address
 * @param amount - Amount to approve
 * @param chainId - Ethereum chain ID
 * @returns Transaction hash of the approval
 */
async function approveERC20ForSwap(
  provider,
  wallet,
  tokenAddress,
  amount,
  chainId = 1
) {
  const walletAddress = wallet.address || wallet.publicKey.toString();

  try {
    // Get the spender address from 1inch
    const apiUrl = `https://api.1inch.io/v5.0/${chainId}/approve/spender`;
    const spenderResponse = await axios.get(apiUrl);
    const spender = spenderResponse.data.address;

    // Using a common ERC20 ABI for the approve function
    const erc20ABI = [
      {
        constant: false,
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    // Create the approval transaction data
    const approveData = encodeApproveFunction(spender, amount, erc20ABI);

    // Check current allowance to avoid redundant approvals
    const allowance = await checkAllowance(
      provider,
      tokenAddress,
      walletAddress,
      spender
    );

    // Skip approval if already approved for sufficient amount
    if (BigInt(allowance) >= BigInt(amount)) {
      console.log("Token already approved for the required amount");
      return null;
    }

    // Create approval transaction
    const tx = {
      from: walletAddress,
      to: tokenAddress,
      data: approveData,
      value: "0x0",
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
    console.log(`Approval transaction confirmed: ${txHash}`);

    return txHash;
  } catch (error) {
    console.error("ERC20 approval failed:", error);
    throw error;
  }
}

/**
 * Approves an ERC20 token specifically for Uniswap
 * @param provider - Ethereum provider
 * @param wallet - User wallet
 * @param tokenAddress - ERC20 token address
 * @param amount - Amount to approve
 * @returns Transaction hash of the approval
 */
export async function approveERC20ForUniswap(
  provider,
  wallet,
  tokenAddress,
  amount
) {
  const UNISWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // V3 Router
  const walletAddress = wallet.address || wallet.publicKey.toString();

  try {
    const erc20ABI = [
      {
        constant: false,
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const approveData = encodeApproveFunction(UNISWAP_ROUTER, amount, erc20ABI);

    const allowance = await checkAllowance(
      provider,
      tokenAddress,
      walletAddress,
      UNISWAP_ROUTER
    );

    if (BigInt(allowance) >= BigInt(amount)) {
      console.log("Token already approved for Uniswap");
      return null;
    }

    const tx = {
      from: walletAddress,
      to: tokenAddress,
      data: approveData,
      value: "0x0",
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
    console.log(`Uniswap approval transaction confirmed: ${txHash}`);

    return txHash;
  } catch (error) {
    console.error("ERC20 approval for Uniswap failed:", error);
    throw error;
  }
}

/**
 * Checks the current allowance for a token
 * @param provider - Ethereum provider
 * @param tokenAddress - Token address
 * @param owner - Token owner address
 * @param spender - Spender address
 * @returns Current allowance
 */
async function checkAllowance(provider, tokenAddress, owner, spender) {
  const abi = [
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const allowance = await contract.allowance(owner, spender);
  return allowance.toString();
}

/**
 * Helper function to encode the approve function call
 */

function encodeApproveFunction(spender, amount, abi) {
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData("approve", [spender, amount.toString()]);
}

/**
 * Swaps tokens using 1inch API
 * @param provider - Ethereum provider
 * @param wallet - User wallet
 * @param fromTokenAddress - Source token address
 * @param toTokenAddress - Destination token address
 * @param amount - Amount to swap in base units
 * @param chainId - Ethereum chain ID
 * @returns Transaction hash
 */
export async function swapWithOneInch(
  provider,
  wallet,
  fromTokenAddress,
  toTokenAddress,
  amount,
  chainId = 1
) {
  const slippage = 1; // 1% slippage
  const API_BASE_URL = `https://api.1inch.io/v5.0/${chainId}`;
  const walletAddress = wallet.address || wallet.publicKey.toString();

  // Fee receiver address (optional)
  const REFERRER_ADDRESS = process.env.SIGNER_PUB_KEY || walletAddress;
  const FEE_PERCENTAGE = 1; // 1% fee to referrer (optional)

  try {
    // Get swap transaction data from 1inch
    const { data: swapData } = await axios.get(`${API_BASE_URL}/swap`, {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount,
        fromAddress: walletAddress,
        slippage,
        referrerAddress: REFERRER_ADDRESS,
        fee: FEE_PERCENTAGE,
        disableEstimate: true, // optional to speed up
      },
    });

    const tx = {
      from: walletAddress,
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value || "0x0",
      gas: swapData.tx.gas || undefined,
      gasPrice: swapData.tx.gasPrice || undefined,
    };

    // Send the transaction
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    console.log("Swap TX Hash:", txHash);

    // Wait for confirmation
    const receipt = await waitForTransaction(provider, txHash);
    console.log("Swap confirmed:", receipt?.transactionHash);

    return txHash;
  } catch (error) {
    console.error("1inch swap failed:", error);
    throw error;
  }
}

/**
 * Swaps tokens using Uniswap V3 directly
 * @param provider - Ethereum provider
 * @param wallet - User wallet
 * @param fromTokenAddress - Source token address
 * @param toTokenAddress - Destination token address
 * @param amount - Amount to swap in base units
 * @returns Transaction hash
 */
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

/**
 * Wait for a transaction to be confirmed
 * @param provider - Ethereum provider
 * @param txHash - Transaction hash
 * @returns Transaction receipt
 */
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

// Helper functions for Uniswap integration
// These are placeholders and would need actual implementation
function encodePath(tokens, fees) {
  const FEE_SIZE = 3;
  const ADDRESS_SIZE = 20;
  const encoded: string[] = [];

  for (let i = 0; i < tokens.length - 1; i++) {
    encoded.push(tokens[i].slice(2).padStart(40, "0")); // address
    encoded.push(fees[i].toString(16).padStart(6, "0")); // uint24 fee
  }
  encoded.push(tokens[tokens.length - 1].slice(2).padStart(40, "0"));

  return `0x${encoded.join("")}`;
}

// Helper: calculate minimum amountOut
function calculateAmountOutMinimum(amountIn, slippagePercent) {
  const slippageFactor = 1 - slippagePercent / 100;
  return (
    (BigInt(amountIn) * BigInt(Math.floor(slippageFactor * 1000))) /
    BigInt(1000)
  );
}

export { buyToken, sellToken, swapToUsdt };
