// Helper functions for Uniswap integration

import { ethers } from "ethers";

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

function normalizeAmount(amount: number | string, decimals = 18): any {
  return ethers.parseUnits(amount.toString(), decimals);
}

async function retry<T>(
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

function structureError(error: any) {
  return {
    success: false,
    error: error?.message || error?.toString() || "Unknown error",
  };
}

export {
  encodePath,
  calculateAmountOutMinimum,
  normalizeAmount,
  retry,
  structureError,
};
