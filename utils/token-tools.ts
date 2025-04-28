import axios from "axios";
import { useState, useEffect } from "react";
import { Alert } from "react-native";

export const useTokenLists = (currentChain) => {
  const [ethjsonList, setEthJsonList] = useState([]);
  const [soljsonList, setSolJsonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        setLoading(true);
        const ethUrl = "https://gateway.ipfs.io/ipns/tokens.uniswap.org";
        const solUrl = "https://tokens.jup.ag/tokens?tags=verified";

        const ethResponse = await axios.get(ethUrl);
        const solResponse = await axios.get(solUrl);

        const ethData = await ethResponse.data.tokens;
        const solData = await solResponse.data;

        setEthJsonList(ethData);
        setSolJsonList(solData);
      } catch (error) {
        console.error("Error loading token list:", error);
        Alert.alert("Error", "Failed to fetch token list.");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenList();
  }, [currentChain]);

  return { ethjsonList, soljsonList, loading };
};
