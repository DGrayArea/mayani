import { ethers } from "ethers";
import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { abi as ERC20_ABI } from "@uniswap/v2-core/build/ERC20.json";

const CHAIN_ID = 1;

/**
 * Interface representing the response from the AlphaRouter quote
 */
export interface AlphaRouterQuote {
  amountOut: bigint;
  route: {
    quote: ethers.BigNumberish;
    methodParameters: {
      to: string;
      calldata: string;
      value: string;
    };
    estimatedGasUsed: ethers.BigNumberish;
  };
}

/**
 * Interface for simulation results
 */
export interface SimulationResult {
  success: boolean;
  error?: string;
  gasEstimate?: bigint;
  details?: any;
}

/**
 * Gets a quote from Uniswap's AlphaRouter
 * @param tokenInAddress The address of the input token
 * @param tokenOutAddress The address of the output token
 * @param amountInStr The amount of input token as a string
 * @param provider An ethers provider
 * @returns A quote object with amount out and route details
 */
export async function getQuoteAlphaRouter(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountInStr: string,
  provider: ethers.Provider,
  recipient: string,
  slippageBips: number = 0.5
): Promise<any> {
  const slippage = slippageBips * 100; // Convert to percentage
  const options: SwapOptionsSwapRouter02 = {
    recipient: recipient,
    slippageTolerance: new Percent(slippage, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800), // 30 minutes
    type: SwapType.SWAP_ROUTER_02,
  };
  // Create token contracts to get decimals
  const tokenInContract = new ethers.Contract(
    tokenInAddress,
    ERC20_ABI,
    provider
  );
  const tokenOutContract = new ethers.Contract(
    tokenOutAddress,
    ERC20_ABI,
    provider
  );

  // Get decimals for both tokens
  const decimalsIn = await tokenInContract.decimals();
  const decimalsOut = await tokenOutContract.decimals();

  // Create Token objects for SDK
  const tokenIn = new Token(CHAIN_ID, tokenInAddress, decimalsIn);
  const tokenOut = new Token(CHAIN_ID, tokenOutAddress, decimalsOut);

  // Parse input amount
  const amountInWei = ethers.parseUnits(amountInStr, decimalsIn);
  const amountIn = CurrencyAmount.fromRawAmount(
    tokenIn,
    amountInWei.toString()
  );

  // Create a new router instance with the provider
  const alphaRouter = new AlphaRouter({
    chainId: CHAIN_ID,
    provider,
  });

  // Get route from AlphaRouter
  const route = await alphaRouter.route(
    amountIn,
    tokenOut,
    TradeType.EXACT_INPUT,
    options
  );

  if (!route) return { message: "No route found", error: true };

  return {
    amountOut: BigInt(route.quote.toString()),
    route,
  };
}

/**
 * Simulates an approval transaction to catch potential errors before execution
 */
export async function simulateApproval(
  tokenAddr: string,
  spender: string,
  amount: bigint,
  signer: ethers.Signer
): Promise<SimulationResult> {
  try {
    const provider = signer.provider;
    if (!provider) throw new Error("Signer must be connected to a provider");

    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await token.allowance(owner, spender);

    // Check if approval is necessary
    if (allowance >= amount) {
      return {
        success: true,
        details: { message: "Sufficient allowance already exists" },
      };
    }

    // Check token balance
    const balance = await token.balanceOf(owner);
    if (balance < amount) {
      return {
        success: false,
        error: `Insufficient token balance. You have ${formatTokenAmount(balance, await token.decimals())} but need at least ${formatTokenAmount(amount, await token.decimals())}`,
      };
    }

    // Simulate approval transaction
    const approveTx = await token.approve.populateTransaction(
      spender,
      ethers.MaxUint256
    );
    approveTx.from = owner;

    // Estimate gas
    try {
      const gasEstimate = await provider.estimateGas(approveTx);

      // Check if user has enough ETH for gas
      const gasPrice = await provider.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || 0n);
      const userBalance = await provider.getBalance(owner);

      if (userBalance < gasCost) {
        return {
          success: false,
          error: `Insufficient ETH for approval gas. Need ${ethers.formatEther(gasCost)} ETH but you have ${ethers.formatEther(userBalance)} ETH`,
          gasEstimate,
        };
      }

      return {
        success: true,
        gasEstimate,
        details: { allowance, balance },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Approval simulation failed: ${error.message || "Unknown error"}`,
        details: error,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Approval simulation error: ${error.message || "Unknown error"}`,
      details: error,
    };
  }
}

/**
 * Ensures approval for token spending
 * @param tokenAddr The token address to approve
 * @param spender The address of the spender
 * @param amount The amount to approve
 * @param signer The signer to execute the approval
 */
export async function ensureApproval(
  tokenAddr: string,
  spender: string,
  amount: bigint,
  signer: ethers.Signer
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    // Simulate first
    const simulation = await simulateApproval(
      tokenAddr,
      spender,
      amount,
      signer
    );
    if (!simulation.success) {
      return { success: false, error: simulation.error };
    }

    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await token.allowance(owner, spender);

    if (allowance < amount) {
      console.log(
        `Approving ${spender} to spend ${amount} of token ${tokenAddr}`
      );
      const tx = await token.approve(spender, ethers.MaxUint256);
      await tx.wait();
      console.log(`Approval successful. Tx hash: ${tx.hash}`);
      return { success: true, hash: tx.hash };
    } else {
      console.log(`Allowance sufficient: ${allowance} >= ${amount}`);
      return { success: true };
    }
  } catch (error: any) {
    console.error("Approval error:", error);
    return {
      success: false,
      error: error.message || "Unknown approval error",
    };
  }
}

/**
 * Simulates a swap to check for potential errors before executing
 */
export async function simulateSwap(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountInStr: string,
  signer: ethers.Signer,
  recipient: string,
  slippageBips: number = 50
): Promise<SimulationResult> {
  try {
    const provider = signer.provider;
    if (!provider) throw new Error("Signer must be connected to a provider");

    const tokenInContract = new ethers.Contract(
      tokenInAddress,
      ERC20_ABI,
      provider
    );
    const decimalsIn = await tokenInContract.decimals();
    const amountInWei = ethers.parseUnits(amountInStr, decimalsIn);

    // Check token balance
    const owner = await signer.getAddress();
    const balance = await tokenInContract.balanceOf(owner);
    if (balance < amountInWei) {
      return {
        success: false,
        error: `Insufficient token balance. You have ${formatTokenAmount(balance, decimalsIn)} but trying to swap ${amountInStr}`,
      };
    }

    // Get the quote
    const quote = await getQuoteAlphaRouter(
      tokenInAddress,
      tokenOutAddress,
      amountInStr,
      provider,
      recipient,
      slippageBips
    );

    if (!quote.route.methodParameters) {
      return {
        success: false,
        error: "No valid route found",
      };
    }

    // Simulate the swap transaction
    const tx = {
      to: quote.route.methodParameters.to,
      data: quote.route.methodParameters.calldata,
      value: ethers.toBigInt(quote.route.methodParameters.value || "0"),
      from: owner,
    };

    // Check user's ETH balance for transaction value
    const userBalance = await provider.getBalance(owner);
    if (userBalance < tx.value) {
      return {
        success: false,
        error: `Insufficient ETH for transaction value. Need ${ethers.formatEther(tx.value)} ETH but you have ${ethers.formatEther(userBalance)} ETH`,
      };
    }

    // Estimate gas
    try {
      const gasEstimate = await provider.estimateGas(tx);
      const gasPrice = await provider.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || 0n);

      // Check if user has enough ETH for gas + value
      const totalEthNeeded = gasCost + tx.value;
      if (userBalance < totalEthNeeded) {
        return {
          success: false,
          error: `Insufficient ETH for gas + value. Need ${ethers.formatEther(totalEthNeeded)} ETH but you have ${ethers.formatEther(userBalance)} ETH`,
          gasEstimate,
        };
      }

      return {
        success: true,
        gasEstimate,
        details: {
          route: quote.route,
          expectedOutput: formatTokenAmount(
            quote.amountOut,
            await new ethers.Contract(
              tokenOutAddress,
              ERC20_ABI,
              provider
            ).decimals()
          ),
        },
      };
    } catch (error: any) {
      // Check if there's an approval issue
      if (error.message?.includes("execution reverted")) {
        // Check if approval is needed
        const spender = quote.route.methodParameters.to;
        const approvalSimulation = await simulateApproval(
          tokenInAddress,
          spender,
          amountInWei,
          signer
        );
        if (!approvalSimulation.success) {
          return approvalSimulation;
        }
      }

      return {
        success: false,
        error: `Swap simulation failed: ${error.message || "Unknown error"}`,
        details: error,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Swap simulation error: ${error.message || "Unknown error"}`,
      details: error,
    };
  }
}

/**
 * Executes a swap using the AlphaRouter
 * @param tokenInAddress The address of the input token
 * @param tokenOutAddress The address of the output token
 * @param amountInStr The amount of input token as a string
 * @param signer The signer to execute the transaction
 * @param slippageBips Slippage tolerance in basis points (1 bip = 0.01%)
 * @returns The transaction response
 */
export async function executeSwapAlphaRouter(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountInStr: string,
  signer: ethers.Signer,
  recipient: string,
  slippageBips: number = 50
): Promise<{
  success: boolean;
  transaction?: ethers.TransactionResponse;
  error?: string;
  simulationResult?: SimulationResult;
}> {
  try {
    // Simulate the swap first
    const simulationResult = await simulateSwap(
      tokenInAddress,
      tokenOutAddress,
      amountInStr,
      signer,
      recipient,
      slippageBips
    );

    if (!simulationResult.success) {
      return {
        success: false,
        error: simulationResult.error,
        simulationResult,
      };
    }

    // Check if signer has provider
    const provider = signer.provider;
    if (!provider) throw new Error("Signer must be connected to a provider");

    // Get quote with custom slippage if provided
    const quote = await getQuoteAlphaRouter(
      tokenInAddress,
      tokenOutAddress,
      amountInStr,
      provider,
      recipient,
      slippageBips
    );

    if (!quote.route.methodParameters) {
      return {
        success: false,
        error: "No valid route found",
      };
    }

    // Ensure approval
    const tokenInContract = new ethers.Contract(
      tokenInAddress,
      ERC20_ABI,
      provider
    );
    const decimalsIn = await tokenInContract.decimals();
    const amountInWei = ethers.parseUnits(amountInStr, decimalsIn);

    const approvalResult = await ensureApproval(
      tokenInAddress,
      quote.route.methodParameters.to,
      amountInWei,
      signer
    );

    if (!approvalResult.success) {
      return {
        success: false,
        error: `Approval failed: ${approvalResult.error}`,
        simulationResult,
      };
    }

    // Prepare transaction with additional gas buffer (20%)
    const gasEstimate =
      simulationResult.gasEstimate ||
      ethers.toBigInt(quote.route.estimatedGasUsed.toString()) + 100000n;
    const gasBuffer = (gasEstimate * 20n) / 100n;

    const tx = {
      to: quote.route.methodParameters.to,
      data: quote.route.methodParameters.calldata,
      value: ethers.toBigInt(quote.route.methodParameters.value || "0"),
      from: await signer.getAddress(),
      gasLimit: gasEstimate + gasBuffer,
    };

    // Send transaction
    const transaction = await signer.sendTransaction(tx);
    return {
      success: true,
      transaction,
      simulationResult,
    };
  } catch (error: any) {
    console.error("Error executing swap:", error);
    return {
      success: false,
      error: `Swap execution error: ${error.message || "Unknown error"}`,
    };
  }
}

/**
 * Helper function to format token amounts with decimals
 * @param amount The amount in base units
 * @param decimals The number of decimals
 * @returns Formatted amount as string
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}
