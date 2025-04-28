import { ethers } from "ethers";
import { getContract, erc20Abi, maxUint256 } from "viem";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import axios from "axios";
import { waitForTransaction } from "./transaction";

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

async function approveERC20ForUniswap(provider, wallet, tokenAddress, amount) {
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

async function checkAllowance(provider, tokenAddress, owner, spender) {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const allowance = await contract.allowance(owner, spender);
  return allowance.toString();
}

async function checkBalance(provider, tokenAddress, owner) {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await contract.balanceOf(owner);
  const decimals = await contract.decimals();
  return { balance: balance.toString(), decimals };
}

function encodeApproveFunction(spender, amount, abi) {
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData("approve", [spender, amount.toString()]);
}

export const approvePermit2 = async ({
  client,
  token,
  spender,
}: {
  client: WalletClient;
  token: Address;
  spender: Address;
}) => {
  const contract = getContract({ address: token, abi: erc20Abi, client });
  const { request } = await contract.simulate.approve([spender, maxUint256]);
  const hash = await contract.write.approve(request.args, {
    account: client?.account,
  });
  return await client.waitForTransactionReceipt({ hash });
};

export {
  approveERC20ForSwap,
  approveERC20ForUniswap,
  checkAllowance,
  checkBalance,
};
