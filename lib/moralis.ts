import axios from "axios";
import { config } from "./appwrite";

const getWalletTokens = async (
  ethAddress: string = "0xcB1C1FdE09f811B294172696404e88E658659905",
  solAddress: string = "EJpLyTeE8XHG9CeREeHd6pr6hNhaRnTRJx4Z5DPhEJJ6"
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
    const solResponse = await axios.get(
      `https://solana-gateway.moralis.io/account/mainnet/${solAddress}/tokens`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": config.moralisKey,
        },
      }
    );
    return { ethTokens: ethResponse.data.result, solTokens: solResponse.data };
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    return { ethTokens: [], solTokens: [] };
  }
};

export { getWalletTokens };
