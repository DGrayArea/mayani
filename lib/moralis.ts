import axios from "axios";
import { config } from "./appwrite";
import { FungibleToken } from "@/types";

const getWalletTokens = async (
  ethAddress: string = "0xcB1C1FdE09f811B294172696404e88E658659905",
  solAddress: string = "oQPnhXAbLbMuKHESaGrbXT17CyvWCpLyERSJA9HCYd7"
) => {
  try {
    const ethResponse = await axios.get(
      `https://deep-index.moralis.io/api/v2.2/wallets/${ethAddress}/tokens`,
      {
        params: {
          chain: "eth",
        },
        headers: {
          accept: "application/json",
          "X-API-Key": config.moralisKey,
        },
      }
    );
    const heliusResponse = await axios.post(
      config.helius2Url,
      {
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: solAddress,
          limit: 1000,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
            showGrandTotal: true,
            showZeroBalance: false,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let fungibleTokens: FungibleToken[] =
      heliusResponse.data.result.items.filter(
        (item): item is FungibleToken =>
          item.interface === "FungibleToken" ||
          item.interface === "FungibleAsset"
      );
    return {
      ethTokens: ethResponse.data.result,
      heliusTokens: fungibleTokens,
      solInfo: {
        balance: String(
          heliusResponse.data.result.nativeBalance.lamports / 1e9
        ),
        price: String(heliusResponse.data.result.nativeBalance.price_per_sol),
        value: String(heliusResponse.data.result.nativeBalance.total_price),
      },
    };
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return { ethTokens: [], solTokens: [] };
  }
};

const getTokenWithPriceInfo = async (
  tokenAddress = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
) => {
  try {
    const tokenInfoResponse = await axios.get(
      `https://lite-api.jup.ag/tokens/v1/token/${tokenAddress}`
    );

    const tokenData = tokenInfoResponse?.data;
    if (tokenData) {
      const priceResponse = await axios.get(
        `https://lite-api.jup.ag/price/v2?ids=${tokenAddress},So11111111111111111111111111111111111111112`
      );

      const priceData = await priceResponse.data;
      const tokenPrice = priceData.data[tokenAddress]?.price;

      const token = {
        symbol: tokenData.symbol,
        address: tokenData.address,
        logo: tokenData.logoURI,
        logoURI: tokenData.logoURI,
        name: tokenData.name,
        fromWallet: true,
        balance: 0,
        value: 0,
        price: tokenPrice,
        decimals: tokenData.decimals,
      };
      return {
        token,
      };
    } else {
      return { token: null };
    }
  } catch (error) {
    console.log(error);
    return { token: null };
  }
};

import { ethers } from "ethers";

const extractTokenInfoFromDexscreener = async (
  tokenAddress = "0xC8EC967914F6eC07CDd2e528eBd010CCA4298Ce8"
) => {
  const response = await axios.get(
    `https://api.dexscreener.com/tokens/v1/ethereum/${tokenAddress}`
  );

  const pair = response.data[0];

  const { baseToken, quoteToken, priceUsd, info } = pair;

  let tokenInfo;

  if (tokenAddress.toLowerCase() === baseToken.address.toLowerCase()) {
    tokenInfo = {
      name: baseToken.name,
      symbol: baseToken.symbol,
      address: baseToken.address,
      price: parseFloat(priceUsd),
      logo: info?.imageUrl || "",
      logoURI: info?.imageUrl || "",
      fromWallet: true,
      balance: 0,
      value: 0,
    };
  } else if (tokenAddress.toLowerCase() === quoteToken.address.toLowerCase()) {
    tokenInfo = {
      name: quoteToken.name,
      symbol: quoteToken.symbol,
      address: quoteToken.address,
      price: 1 / parseFloat(priceUsd),
      logo: info?.imageUrl || "",
      logoURI: info?.imageUrl || "",
      fromWallet: true,
      balance: 0,
      value: 0,
    };
  } else {
    console.error("Token address not found in pair data");
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.alchemyTransport);
    const tokenContract = new ethers.Contract(
      tokenInfo.address,
      ["function decimals() view returns (uint8)"],
      provider
    );
    const decimals = await tokenContract.decimals();
    tokenInfo.decimals = decimals;
  } catch (err) {
    console.error("Error fetching decimals:", err);
    tokenInfo.decimals = 18;
  }

  return tokenInfo;
};

export {
  getWalletTokens,
  getTokenWithPriceInfo,
  extractTokenInfoFromDexscreener,
};
