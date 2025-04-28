import { ethTokens } from "../config/eth";
import { solTokens } from "../config/sol";
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
        //@ts-expect-error expect
        setEthJsonList(ethTokens);
        //@ts-expect-error expect
        setSolJsonList(solTokens);
      } catch (error) {
        console.error("Error loading token list:", error);
        //@ts-ignore
        Alert.alert("Error", "Failed to fetch token list.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenList();
  }, [currentChain]);

  return { ethjsonList, soljsonList, loading };
};
