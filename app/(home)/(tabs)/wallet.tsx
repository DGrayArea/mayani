import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReceiveModal from "@/components/dialog/ReceiveModal";
import SendModal from "@/components/dialog/SendModal";
import useWalletStore from "@/hooks/walletStore";
import images from "@/constants/images";
import ChainSelector from "@/components/ChainSelector";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { ethers } from "ethers";
import {
  get0xPermit2Approve,
  get0xPermit2Price,
  get0xPermit2Swap,
} from "@/utils/transaction";
import { checkAllowance, checkBalance } from "@/utils/approvals";
import { config } from "@/lib/appwrite";
import { useTokenLists } from "@/utils/token-tools";
import { getWalletTokens } from "@/lib/moralis";
import { quoteWithJupiter, swapWithJupiter } from "@/utils/trade";
import { Connection } from "@solana/web3.js";
import PrivateKeyModal from "@/components/dialog/PrivateKeyModal";

const tokenList = {
  ETH: {
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      icon: images.eth1,
      decimals: 18,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
    tokens: {
      USDT: {
        symbol: "USDT",
        name: "Tether USD",
        icon: null,
        decimals: 6,
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
    },
  },
  SOL: {
    nativeToken: {
      symbol: "SOL",
      name: "Solana",
      icon: images.sol1,
      decimals: 9,
      address: "So11111111111111111111111111111111111111112",
    },
    tokens: {
      USDT: {
        symbol: "USDT",
        name: "Tether USD",
        icon: null,
        decimals: 6,
        address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      },
    },
  },
};

const Wallet = () => {
  const {
    solWalletAddress,
    ethWalletAddress,
    generateSolWallet,
    generateEthWallet,
    currentChain,
    switchChain,
    getBalance,
    privateKey,
    solPrivateKey,
  } = useWalletStore();

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [approval, setApproval] = useState("0");
  const [walletData, setWalletData] = useState({
    eth: {
      balance: 0,
      price: 2150.75,
      change: "3.2",
    },
    sol: {
      balance: 0,
      price: 152.43,
      change: "5.7",
    },
    usdt: {
      balance: 0,
      price: 1.0,
      change: "0.0",
    },
  });
  const [isErc20Approved, setIsErc20Approved] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fromTokenSelectVisible, setFromTokenSelectVisible] = useState(false);
  const [toTokenSelectVisible, setToTokenSelectVisible] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [priceData, setPriceData] = useState<any>({});
  const [privateKeyModal, setPrivateKeyModal] = useState(true);
  interface UserAssets {
    ethTokens: {
      logo: string;
      usd_price: number;
      symbol: string;
      usd_price_24hr_percent_change: string;
      balance_formatted: number;
      token_address: string;
      name: string;
    }[];
    solTokens: {
      logo: string;
      usd_price: number;
      symbol: string;
      usd_price_24hr_percent_change: string;
      balance_formatted: number;
      mint: string;
      amount: string;
      name: string;
    }[];
  }

  const [userAssets, setsetUserAssets] = useState<UserAssets>({
    ethTokens: [],
    solTokens: [],
  });

  const [swapFromData, setSwapFromData] = useState(() => ({
    symbol: currentChain === "ETH" ? "ETH" : "SOL",
    address:
      currentChain === "ETH"
        ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        : "So11111111111111111111111111111111111111112",
    logo: currentChain === "ETH" ? images.eth1 : images.sol1,
    balance: currentChain === "ETH" ? 0 : getBalance("sol"),
    decimals: currentChain === "ETH" ? 18 : 9,
  }));

  const [swapToData, setSwapToData] = useState(() => ({
    symbol: "USDT",
    address:
      currentChain === "ETH"
        ? "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    logo: currentChain === "ETH" ? images.tetherLogo : images.tetherLogo,
    balance: 0,
    decimals: currentChain === "ETH" ? 6 : 6,
  }));

  useEffect(() => {
    if (currentChain === "ETH") {
      setSwapFromData({
        symbol: "ETH",
        address: tokenList.ETH.nativeToken.address,
        logo: images.eth1,
        balance: getBalance("eth"),
        decimals: tokenList.ETH.nativeToken.decimals,
      });
    } else {
      setSwapFromData({
        symbol: "SOL",
        address: tokenList.SOL.nativeToken.address,
        logo: images.sol1,
        balance: getBalance("sol"),
        decimals: tokenList.SOL.nativeToken.decimals,
      });
    }
  }, [currentChain]);
  const swapFromCrypto = swapFromData?.address ?? null;
  const swapToCrypto = swapToData?.address ?? null;

  useEffect(() => {
    if (!solWalletAddress) {
      generateSolWallet();
    }
    if (!ethWalletAddress) {
      generateEthWallet();
    }
    // Simulate fetching wallet data
    fetchWalletData();
  }, []);

  useEffect(() => {
    const getUserAssets = async () => {
      if (ethWalletAddress && solWalletAddress) {
        const assets = await getWalletTokens(
          ethWalletAddress,
          solWalletAddress
        );
        setsetUserAssets(assets);
      }
    };
    getUserAssets();
  }, [ethWalletAddress, solWalletAddress]);

  useEffect(() => {
    const tryData = async () => {
      if (currentChain === "ETH" && swapFromCrypto && ethWalletAddress) {
        setIsErc20Approved(false);
        try {
          const provider = new ethers.JsonRpcProvider(config.alchemyTransport);
          if (swapFromCrypto === tokenList.ETH.nativeToken.address) {
            const [price] = await Promise.all([
              get0xPermit2Price({
                chainId: 1,
                sellToken: swapFromCrypto,
                buyToken: swapToCrypto!,
                sellAmount: String(1 * 10 ** Number(swapFromData.decimals)),
                taker: ethWalletAddress,
              }),
            ]);
            setPriceData(price);
            setIsErc20Approved(true);
          } else {
            const [price, allowance, tokenBalance] = await Promise.all([
              get0xPermit2Price({
                chainId: 1,
                sellToken: swapFromCrypto,
                buyToken: swapToCrypto!,
                sellAmount: String(1e18),
                taker: ethWalletAddress,
              }),
              checkAllowance(
                provider,
                swapFromCrypto,
                ethWalletAddress,
                "0x000000000022D473030F116dDEE9F6B43aC78BA3"
              ),
              checkBalance(provider, swapFromCrypto, ethWalletAddress),
            ]);

            setPriceData(price);

            const allowanceBase10 = Number(
              ethers.formatUnits(allowance, tokenBalance.decimals)
            );
            const balanceBase10 = Number(
              ethers.formatUnits(tokenBalance.balance, tokenBalance.decimals)
            );

            setApproval(String(allowanceBase10));

            const isEnoughBalance = allowanceBase10 > balanceBase10;
            setIsErc20Approved(isEnoughBalance);
          }
        } catch (error) {
          console.error("Failed to fetch swap/allowance/balance:", error);
        }
      } else {
        try {
          const quote = await quoteWithJupiter(
            swapFromCrypto,
            swapToCrypto,
            String(1 * 10 ** swapFromData.decimals)
          );
          setPriceData(quote);
        } catch (error) {
          console.error("Failed to fetch Solana swap quote:", error);
        }
      }
    };

    tryData();
  }, [swapFromCrypto, swapToCrypto, ethWalletAddress, solWalletAddress]);

  const isAmountValid = () =>
    useMemo(
      () => parseFloat(String(swapAmount || 0)) <= balance,
      [swapAmount, balance]
    );

  const truncateAddress = (address) => {
    // if (!address || address.length <= 10) return address;
    // return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return address;
  };

  const fetchWalletData = async () => {
    setRefreshing(true);

    setTimeout(() => {
      setWalletData({
        eth: {
          balance: 0,
          price: 2150.75,
          change: "+3.2%",
        },
        sol: {
          balance: 0,
          price: 152.43,
          change: "+5.7%",
        },
        usdt: {
          balance: 0,
          price: 1.0,
          change: "0.0%",
        },
      });
      setRefreshing(false);
    }, 1000);
  };

  const getSwapFee = (chain, fromToken, toToken) => {
    if (chain === "ETH") {
      if (fromToken === "ETH" && toToken === "USDT") return "0.3%";
      return "0.3%"; // Default Uniswap fee
    } else if (chain === "SOL") {
      if (fromToken === "SOL" && toToken === "USDT") return "0.1%";
      return "0.25%"; // Default Jupiter fee
    }
    return "0.5%"; // Default fallback
  };

  const getProtocolText = (chain, fromToken, toToken) => {
    if (chain === "ETH") {
      return `Using Uniswap protocol for ${fromToken} ↔ ${toToken}`;
    } else if (chain === "SOL") {
      return `Using Jupiter protocol for ${fromToken} ↔ ${toToken}`;
    }
    return "Using optimal DEX routing";
  };

  const handleSwap = useCallback(async () => {
    if (!isAmountValid || parseFloat(String(swapAmount || 0)) <= 0) return;

    try {
      setIsSwapping(true);

      if (currentChain === "ETH") {
        if (Number(swapAmount) <= Number(swapFromData.balance)) {
          const txid = await get0xPermit2Swap(
            swapFromCrypto,
            swapToCrypto,
            Number(swapAmount) * 10 ** Number(swapFromData.decimals),
            ethWalletAddress,
            privateKey!
          );
          // Update balances after successful swap
          await fetchWalletData();

          // Reset form and close modal
          setSwapAmount("0");
          setSwapModalVisible(false);
          const assets = await getWalletTokens();
          setsetUserAssets(assets);
          // Show success message
          Alert.alert(
            "Success",
            `Swap completed successfully: https://etherscan.io/tx/${txid?.hash}`
          );
        } else {
          Alert.alert(
            "Error",
            "Insufficient balance for the swap amount or no swap route found"
          );
        }
      } else if (currentChain === "SOL") {
        if (Number(swapAmount) <= Number(swapFromData.balance)) {
          const txid = await swapWithJupiter(
            new Connection(config.heliusUrl),
            swapFromCrypto,
            swapToCrypto,
            String(Number(swapAmount) * 10 ** Number(swapFromData.decimals)),
            solPrivateKey!
          );
          // Update balances after successful swap
          await fetchWalletData();

          // Reset form and close modal
          setSwapAmount("0");
          setSwapModalVisible(false);
          const assets = await getWalletTokens();
          setsetUserAssets(assets);

          // Show success message
          Alert.alert(
            "Success",
            `Swap completed successfully: https://solscan.io/tx/${txid?.hash}`
          );
        } else {
          Alert.alert(
            "Error",
            "Insufficient balance for the swap amount or no swap route found"
          );
        }
      }
    } catch (error) {
      console.error("Swap error:", error);
      Alert.alert(
        "Error",
        "Failed to complete swap due to insufficient gas or allowance"
      );
    } finally {
      setIsSwapping(false);
    }
  }, [
    swapAmount,
    swapFromData,
    swapToData,
    ethWalletAddress,
    solPrivateKey,
    currentChain,
  ]);

  const handleApprove = useCallback(async () => {
    try {
      setIsApproving(true);
      const txid = await get0xPermit2Approve(
        privateKey!,
        swapAmount,
        swapFromCrypto
      );
      setIsErc20Approved(true);
      // Show success message
      Alert.alert(
        "Success",
        `${swapFromData?.symbol} approved for swapping https://etherscan.io/tx/${txid?.hash}`
      );
    } catch (error) {
      console.error("Approval error:", error);
      Alert.alert(
        "Error",
        "Failed to approve token due to insufficient gas or allowance"
      );
    } finally {
      setIsApproving(false);
    }
  }, [privateKey, swapFromCrypto, swapAmount]);

  const getTokenLogo = (chain, address) => {
    if (chain === "ETH") {
      if (address === tokenList.ETH.nativeToken.address) return images.eth1;
      if (
        address === tokenList.ETH.tokens.USDT.address ||
        address === tokenList.SOL.tokens.USDT.address
      )
        return images.tetherLogo;
      return images.defaultLogo;
    } else if (chain === "SOL") {
      if (address === tokenList.SOL.nativeToken.address) return images.sol1;
      if (
        address === tokenList.ETH.tokens.USDT.address ||
        address === tokenList.SOL.tokens.USDT.address
      )
        return images.tetherLogo;
      // For SOL tokens, use specific images or default
      return images.defaultLogo;
    }
    return images.defaultLogo;
  };

  const calculateTotalAssets = useMemo(() => {
    const ethToken = userAssets?.ethTokens?.find(
      (token) => token.symbol === "ETH"
    );

    if (!ethToken) return "0.00";

    const balance = parseFloat(String(ethToken.balance_formatted || "0"));
    const price = ethToken.usd_price || 0;

    return (balance * price).toFixed(2);
  }, [userAssets]);

  const ActionButton = ({ icon, label, onPress, primary = false }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        primary ? styles.primaryActionButton : styles.secondaryActionButton,
      ]}
      onPress={onPress}
    >
      <View style={styles.actionButtonContent}>
        <Image source={icon} style={styles.actionButtonIcon} />
        <Text style={styles.actionButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const CryptoCard = ({
    crypto,
    symbol,
    balance,
    price,
    change,
    logo,
    address,
    name,
  }) => {
    let icon = null;
    let fullName = "";

    if (crypto === "eth") {
      icon = images.eth1;
      fullName = "Ethereum";
    } else if (crypto === "sol") {
      icon = images.sol1;
      fullName = "Solana";
    } else if (crypto === "usdt") {
      fullName = "Tether USD";
      // Using FontAwesome for USDT icon
      icon = null;
    }

    return (
      <TouchableOpacity style={styles.cryptoCard}>
        <View className="flex flex-row justify-between items-center">
          <View style={styles.cryptoHeader}>
            <View
              style={[
                styles.cryptoIconContainer,
                crypto === "usdt" && {
                  backgroundColor: "rgba(38, 161, 123, 0.2)",
                },
              ]}
            >
              {crypto == "solana" ? (
                <Image
                  source={logo}
                  style={styles.cryptoIcon}
                  className="rounded-full"
                />
              ) : (
                <Image
                  source={{ uri: logo }}
                  style={styles.cryptoIcon}
                  className="rounded-full"
                />
              )}
            </View>
            <View>
              <Text style={styles.cryptoName}>{symbol}</Text>
              <Text style={styles.cryptoFullName}>
                {name.length > 15 ? name.slice(0, 15) + "..." : name}
              </Text>
            </View>
          </View>
          <ActionButton
            icon={currentChain === "SOL" ? images.sol1 : images.eth1}
            label="Swap"
            onPress={() => setSwapModalVisible(true)}
            primary={true}
          />
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceAmount}>
            {Number(balance).toFixed(4)} {symbol.toUpperCase()}
          </Text>
          <Text style={styles.balanceUsd}>
            ${(Number(balance) * Number(price)).toFixed(2)}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>${Number(price).toFixed(6)}</Text>
          <Text
            style={[
              styles.changeText,
              String(change).includes("-")
                ? styles.negativeChange
                : String(change) === "0.0"
                  ? styles.positiveChange
                  : styles.positiveChange,
            ]}
          >
            {isNaN(Number(change))
              ? (0.0).toFixed(2)
              : Number(change).toFixed(2)}
            %
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TransactionItem = ({ transaction }) => {
    const isReceive = transaction.type === "receive";
    return (
      <View style={styles.transactionItem}>
        <View
          style={[
            styles.transactionIconContainer,
            isReceive ? styles.receiveIcon : styles.sendIcon,
          ]}
        >
          <Text style={styles.transactionIconText}>
            {isReceive ? "+" : "-"}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {isReceive ? "Received" : "Sent"} {transaction.symbol}
          </Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.transactionAmountText,
              isReceive ? styles.receiveText : styles.sendText,
            ]}
          >
            {isReceive ? "+" : "-"}
            {transaction.amount} {transaction.symbol}
          </Text>
          <Text style={styles.transactionStatus}>{transaction.status}</Text>
        </View>
      </View>
    );
  };

  const handleSelectToken = (token, direction) => {
    try {
      if (!direction) {
        setSwapToData({
          symbol: token.symbol,
          address: token.address,
          logo: token.logoURI ? token.logoURI : token.logo,
          balance: token.balance ? token.balance : 0,
          decimals: token.decimals,
        });
        setToTokenSelectVisible(false);
      } else {
        setBalance(Number(token.balance));
        setSwapFromData({
          symbol: token.symbol,
          address: token.address,
          logo: token.logoURI ? token.logoURI : token.logo,
          balance: token.balance ? token.balance : 0,
          decimals: token.decimals,
        });
        setFromTokenSelectVisible(false);
      }
    } catch (error) {
      console.log(error);
    }
    setSwapAmount("");
  };

  const { loading, ethjsonList, soljsonList } = useTokenLists(currentChain);

  const renderSwapModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={swapModalVisible}
      onRequestClose={() => setSwapModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {fromTokenSelectVisible ? (
            <TokenSelectionView
              // onSelectToken={handleFromTokenSelect}
              // onClose={() => setFromTokenSelectVisible(false)}
              currentChain={currentChain}
              // walletData={walletData}
              direction={true}
            />
          ) : toTokenSelectVisible ? (
            <TokenSelectionView
              // onSelectToken={handleToTokenSelect}
              // onClose={() => setToTokenSelectVisible(false)}
              currentChain={currentChain}
              // walletData={walletData}
              direction={false}
            />
          ) : (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Swap Tokens</Text>
                <TouchableOpacity
                  onPress={() => setSwapModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesome name="times" size={20} color="#E0E0E0" />
                </TouchableOpacity>
              </View>
              <View style={styles.swapFromContainer}>
                <Text style={styles.swapLabel}>From</Text>
                <View style={styles.swapInputContainer}>
                  <TextInput
                    style={[
                      styles.swapAmountInput,
                      !isAmountValid && parseFloat(swapAmount) > 0
                        ? styles.invalidInput
                        : null,
                    ]}
                    value={String(swapAmount)}
                    onChangeText={setSwapAmount}
                    placeholder="0.0"
                    placeholderTextColor="#9B86B3"
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    style={styles.swapTokenSelector}
                    onPress={() => setFromTokenSelectVisible(true)}
                  >
                    <View style={styles.tokenSelectorInner}>
                      <Image
                        source={
                          swapFromData.logo
                            ? swapFromData.logo
                            : getTokenLogo(currentChain, swapFromCrypto)
                        }
                        style={styles.swapTokenIcon}
                      />
                      <Text style={styles.swapTokenText}>
                        {swapFromData?.symbol}
                      </Text>
                      <FontAwesome
                        name="angle-down"
                        size={16}
                        color="#9B86B3"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceText}>
                    Balance: {Number(swapFromData.balance).toFixed(4)}{" "}
                    {swapFromData?.symbol!}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setSwapAmount(Number(swapFromData.balance).toString())
                    }
                  >
                    <Text style={styles.maxButton}>MAX</Text>
                  </TouchableOpacity>
                </View>
                {!isAmountValid && parseFloat(swapAmount) > 0 && (
                  <Text style={styles.errorText}>Insufficient balance</Text>
                )}
              </View>

              <View style={styles.swapArrowContainer}>
                <TouchableOpacity
                  style={styles.swapArrowButton}
                  // onPress={() => {
                  //   setSwapAmount("");
                  // }}
                >
                  <FontAwesome name="exchange" size={20} color="#8C5BE6" />
                </TouchableOpacity>
              </View>

              {/* To Token Section */}
              <View style={styles.swapToContainer}>
                <Text style={styles.swapLabel}>To</Text>
                <View style={styles.swapOutputContainer}>
                  <Text style={styles.estimatedAmountText}>
                    {currentChain === "SOL"
                      ? Number(priceData?.outAmount) > 0
                        ? (
                            Number(swapAmount) *
                            (Number(priceData?.outAmount) /
                              10 ** Number(swapToData.decimals))
                          ).toFixed(6)
                        : 0.0
                      : Number(priceData?.quote?.buyAmount) > 0
                        ? (Number(swapAmount) *
                            Number(priceData?.quote?.buyAmount)) /
                          10 ** swapToData.decimals
                        : 0.0}{" "}
                  </Text>
                  <TouchableOpacity
                    style={styles.swapTokenSelector}
                    onPress={() => setToTokenSelectVisible(true)}
                  >
                    <View style={styles.tokenSelectorInner}>
                      <Image
                        source={
                          swapToData.logo
                            ? swapToData.logo
                            : getTokenLogo(currentChain, swapToCrypto)
                        }
                        style={styles.swapTokenIcon}
                      />
                      <Text style={styles.swapTokenText}>
                        {swapToData?.symbol!}
                      </Text>
                      <FontAwesome
                        name="angle-down"
                        size={16}
                        color="#9B86B3"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.balanceText}>
                  Balance:{" "}
                  {swapToData.balance
                    ? Number(swapToData.balance)?.toFixed(4)
                    : "0.0000"}{" "}
                  {swapToData?.symbol}
                </Text>
              </View>

              {/* Swap Details */}
              <View style={styles.swapDetailsContainer}>
                <View style={styles.swapDetailRow}>
                  <Text style={styles.swapDetailLabel}>Rate</Text>
                  <Text style={styles.swapDetailValue}>
                    1 {swapFromData?.symbol} ≈{" "}
                    {currentChain === "SOL"
                      ? Number(priceData?.outAmount) > 0
                        ? (
                            Number(priceData?.outAmount) /
                            10 ** Number(swapToData.decimals)
                          ).toFixed(6)
                        : 0.0
                      : Number(priceData?.quote?.buyAmount) > 0
                        ? Number(priceData?.quote?.buyAmount) /
                          10 ** swapToData.decimals
                        : 0.0}{" "}
                    {swapToData?.symbol}
                  </Text>
                </View>
                <View style={styles.swapDetailRow}>
                  <Text style={styles.swapDetailLabel}>Fee</Text>
                  <Text style={styles.swapDetailValue}>
                    {getSwapFee(currentChain, swapFromCrypto, swapToCrypto)}
                  </Text>
                </View>
                <View style={styles.swapDetailRow}>
                  <Text style={styles.swapDetailLabel}>Slippage</Text>
                  <View style={styles.slippageContainer}>
                    <TouchableOpacity
                      style={[
                        styles.slippageButton,
                        slippage === "0.5" && styles.slippageButtonActive,
                      ]}
                      onPress={() => setSlippage("0.5")}
                    >
                      <Text style={styles.slippageButtonText}>0.5%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.slippageButton,
                        slippage === "1.0" && styles.slippageButtonActive,
                      ]}
                      onPress={() => setSlippage("1.0")}
                    >
                      <Text style={styles.slippageButtonText}>1.0%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.slippageButton,
                        slippage === "2.0" && styles.slippageButtonActive,
                      ]}
                      onPress={() => setSlippage("2.0")}
                    >
                      <Text style={styles.slippageButtonText}>2.0%</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.swapProtocolContainer}>
                <Text style={styles.swapProtocolText}>
                  {getProtocolText(
                    currentChain,
                    swapFromData?.symbol!,
                    swapToData?.symbol!
                  )}
                </Text>
              </View>

              {currentChain === "SOL" ? (
                <TouchableOpacity
                  style={[
                    styles.swapButton,
                    (!isAmountValid || parseFloat(swapAmount) <= 0) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSwap}
                  disabled={
                    !isAmountValid || parseFloat(swapAmount) <= 0 || isSwapping
                  }
                >
                  <Text style={styles.swapButtonText}>Swap Tokens</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {swapFromCrypto === tokenList.ETH.nativeToken.address ? (
                    <TouchableOpacity
                      style={[
                        styles.swapButton,
                        (!isAmountValid || parseFloat(swapAmount) <= 0) &&
                          styles.disabledButton,
                      ]}
                      onPress={handleSwap}
                      disabled={
                        !isAmountValid ||
                        parseFloat(swapAmount) <= 0 ||
                        isSwapping
                      }
                    >
                      <Text style={styles.swapButtonText}>Swap Tokens</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {!isErc20Approved ? (
                        <TouchableOpacity
                          style={[
                            styles.approveButton,
                            !isAmountValid && styles.disabledButton,
                          ]}
                          onPress={handleApprove}
                          disabled={!isAmountValid || isApproving || isSwapping}
                        >
                          <Text style={styles.swapButtonText}>
                            {isApproving
                              ? "Approving..."
                              : `Approve ${swapFromData?.symbol!}`}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.swapButton,
                            (!isAmountValid || parseFloat(swapAmount) <= 0) &&
                              styles.disabledButton,
                          ]}
                          onPress={handleSwap}
                          disabled={
                            !isAmountValid ||
                            parseFloat(swapAmount) <= 0 ||
                            isSwapping
                          }
                        >
                          <Text style={styles.swapButtonText}>Swap Tokens</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </View>
      {(isSwapping || isApproving) && (
        <View style={styles.overlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </Modal>
  );

  const TokenSelectionView = ({ currentChain, direction }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }, [searchQuery]);

    const filteredTokens = useMemo(() => {
      const tokensArray =
        currentChain === "ETH" ? ethjsonList || [] : soljsonList || [];

      const walletTokensArray =
        (currentChain === "ETH"
          ? userAssets?.ethTokens
          : userAssets?.solTokens) || [];

      // Map wallet tokens first (these should take priority)
      const mappedWalletTokens = walletTokensArray.map((token) => ({
        symbol: token.symbol,
        address: currentChain === "ETH" ? token.token_address : token.mint,
        logoURI: token.logo ?? getTokenLogo(currentChain, token.symbol),
        name: token.name || token.symbol,
        fromWallet: true,
        // Include any additional wallet-specific data
        balance:
          currentChain === "ETH" ? token.balance_formatted : token.amount,
        value: token.value,
        price: token.price,
        decimals: token.decimals,
      }));

      const limitedTokensArray = tokensArray.slice(0, 100);

      // ✅ Correct order
      const allTokens = [...mappedWalletTokens, ...limitedTokensArray];

      const uniqueTokensMap = new Map();
      allTokens.forEach((token) => {
        if (token.address && !uniqueTokensMap.has(token.address)) {
          uniqueTokensMap.set(token.address, token);
        }
      });
      const mergedTokens = Array.from(uniqueTokensMap.values());

      if (debouncedSearchQuery.length === 0) {
        return mergedTokens;
      } else {
        const searchResult = mergedTokens.filter(
          (token) =>
            token.symbol
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            token.address
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
        );
        return searchResult;
      }
    }, [
      currentChain,
      debouncedSearchQuery,
      ethjsonList,
      soljsonList,
      userAssets,
    ]);
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Swap Tokens</Text>
          <TouchableOpacity
            onPress={() => {
              setFromTokenSelectVisible(false);
              setToTokenSelectVisible(false);
            }}
            //@ts-expect-error none
            style={styles.closeButton}
          >
            <FontAwesome name="times" size={20} color="#E0E0E0" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer2}>
          <FontAwesome
            name="search"
            size={16}
            color="#9B86B3"
            style={styles.searchIcon2}
          />
          <TextInput
            placeholder={`Search ${direction ? "in" : "out"} token by symbol or address`}
            placeholderTextColor="#9B86B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput2}
            autoCapitalize="none"
          />
        </View>
        <Text className="text-white text-lg font-semi-bold">
          {direction ? "Select Token to Swap" : "Select Token to Receive"}
        </Text>
        <ScrollView style={{ flex: 1 }}>
          <>
            {loading ? (
              <Text className="text-white font-semibold text-xl mt-4">
                Loading Token List ...
              </Text>
            ) : (
              <>
                {currentChain === "SOL" && (
                  <TouchableOpacity
                    style={styles.tokenItem}
                    onPress={() =>
                      handleSelectToken(
                        {
                          symbol: tokenList.SOL.nativeToken.symbol,
                          address: tokenList.SOL.nativeToken.address,
                          logoURI: tokenList.SOL.nativeToken.icon,
                          name: tokenList.SOL.nativeToken.name,
                          fromWallet: true,
                          balance: getBalance("sol"),
                          value: walletData.sol.price,
                          price: walletData.sol.price,
                          decimals: tokenList.SOL.nativeToken.decimals,
                          logo: tokenList.SOL.nativeToken.icon,
                        },
                        direction
                      )
                    }
                  >
                    <View style={styles.tokenItemLeft2}>
                      <Image
                        source={
                          tokenList.SOL.nativeToken.icon ??
                          getTokenLogo(
                            currentChain,
                            tokenList.SOL.nativeToken.symbol
                          )
                        }
                        style={styles.tokenItemIcon2}
                      />

                      <Text style={styles.tokenItemSymbol2}>
                        {tokenList.SOL.nativeToken.symbol}
                      </Text>
                    </View>
                    <Text style={styles.tokenItemBalance2}>
                      {getBalance("sol")
                        ? Number(getBalance("sol"))?.toFixed(4)
                        : "0.0000"}
                    </Text>
                  </TouchableOpacity>
                )}
                {filteredTokens.map((token) => (
                  <TouchableOpacity
                    key={token.address}
                    style={styles.tokenItem}
                    onPress={() => handleSelectToken(token, direction)}
                  >
                    <View style={styles.tokenItemLeft2}>
                      <Image
                        source={
                          token.logoURI
                            ? { uri: token.logoURI }
                            : getTokenLogo(currentChain, token.symbol)
                        }
                        style={styles.tokenItemIcon2}
                      />

                      <Text style={styles.tokenItemSymbol2}>
                        {token.symbol}
                      </Text>
                    </View>
                    <Text style={styles.tokenItemBalance2}>
                      {token.balance
                        ? Number(token?.balance)?.toFixed(4)
                        : "0.0000"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchWalletData} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ape It Wallet</Text>
          <ChainSelector
            chainLogos={{
              SOL: images.sol1,
              ETH: images.eth1,
            }}
            currentChain={currentChain}
            switchChain={switchChain}
          />
        </View>
        <LinearGradient
          colors={["#8C5BE6", "#5A2DA0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalAssetsCard}
        >
          <Text style={styles.totalAssetsLabel}>Total Balance</Text>
          <Text style={styles.totalAssetsAmount}>${calculateTotalAssets}</Text>
          <View style={styles.walletAddressContainer}>
            <Text style={styles.walletAddressLabel}>
              {currentChain === "SOL" ? "SOL Address" : "ETH Address"}:
            </Text>
            <Text style={styles.walletAddress} numberOfLines={1}>
              {truncateAddress(
                currentChain === "SOL" ? solWalletAddress : ethWalletAddress
              )}
            </Text>
          </View>
        </LinearGradient>
        <View style={styles.actionsContainer}>
          <ActionButton
            icon={currentChain === "SOL" ? images.sol1 : images.eth1}
            label="Receive"
            onPress={() => setReceiveModalVisible(true)}
          />
          <ActionButton
            icon={currentChain === "SOL" ? images.sol1 : images.eth1}
            label="Send"
            onPress={() => setSendModalVisible(true)}
            primary={true}
          />
        </View>
        <Text style={styles.sectionTitle}>Your Assets</Text>
        <View style={styles.cryptoContainer}>
          <ScrollView style={{ flex: 1 }}></ScrollView>
          <>
            {currentChain === "SOL" ? (
              <CryptoCard
                crypto="solana"
                name={"Solana"}
                logo={images.sol1}
                price={walletData.sol.price || 0.0}
                symbol={"SOL"}
                change={walletData.sol.change || 0.0}
                balance={walletData?.sol.balance}
                address={"So11111111111111111111111111111111111111112"}
              />
            ) : null}
          </>
          <>
            {currentChain === "ETH"
              ? userAssets.ethTokens.map((asset) => (
                  <CryptoCard
                    key={asset?.token_address}
                    logo={asset?.logo}
                    price={asset?.usd_price}
                    symbol={asset?.symbol}
                    change={asset?.usd_price_24hr_percent_change}
                    balance={asset?.balance_formatted}
                    crypto="eth"
                    name={asset.name}
                    address={asset?.token_address}
                  />
                ))
              : userAssets.solTokens.map((asset) => (
                  <CryptoCard
                    key={asset?.mint}
                    crypto="sol"
                    name={asset.name}
                    logo={asset?.logo}
                    price={asset?.usd_price || 0.0}
                    symbol={asset?.symbol}
                    change={asset?.usd_price_24hr_percent_change || 0.0}
                    balance={asset?.amount}
                    address={asset?.mint}
                  />
                ))}
          </>

          {/* <CryptoCard crypto="usdt" data={walletData.usdt} /> */}
        </View>
        <View style={styles.noTransactionsContainer}>
          <LinearGradient
            colors={["rgba(140, 91, 230, 0.1)", "rgba(90, 45, 160, 0.1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noTransactionsGradient}
          >
            <Image
              source={require("@/assets/icon.jpg")}
              style={styles.noTransactionsImage}
            />
            <Text style={styles.noTransactionsTitle}>
              Welcome to Ape It Wallet
            </Text>
            <Text style={styles.noTransactionsText}>
              Your transactions will appear here when you start using your
              wallet. Send or receive tokens to get started!
            </Text>
          </LinearGradient>
        </View>
        <ReceiveModal
          visible={receiveModalVisible}
          onClose={() => setReceiveModalVisible(false)}
        />
        <SendModal
          visible={sendModalVisible}
          onClose={() => setSendModalVisible(false)}
        />
        <PrivateKeyModal
          visible={privateKeyModal}
          onClose={() => setPrivateKeyModal(false)}
        />
        {/* Rest of your component code */}
        {renderSwapModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // fills entire screen
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  tokenSelectionWrapper2: {
    flex: 1,
    backgroundColor: "#2E1A40",
    borderRadius: 12,
  },
  tokenSelectionHeader2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140, 91, 230, 0.3)",
  },
  tokenSelectionTitle2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  tokenSelectionCloseButton: {
    padding: 8,
  },
  searchContainer2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  searchIcon2: {
    marginRight: 8,
  },
  searchInput2: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 16,
    paddingVertical: 12,
  },
  tokenList2: {
    flex: 1,
  },
  tokenItem2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140, 91, 230, 0.1)",
  },
  tokenItemLeft2: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenItemIcon2: {
    width: 30,
    height: 30,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#1A0E26",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  tokenItemSymbol2: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E0E0E0",
  },
  tokenItemBalance2: {
    fontSize: 14,
    color: "#9B86B3",
  },
  tokenSelectionWrapper: {
    flex: 1,
    backgroundColor: "#2E1A40",
    borderRadius: 12,
  },
  tokenSelectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140, 91, 230, 0.3)",
  },
  tokenSelectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  tokenSelectionContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  closeButton: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  tokenList: {
    flex: 1,
  },
  tokenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: "500",
  },
  tokenBalance: {
    fontSize: 14,
    color: "#666",
  },
  container: {
    flex: 1,
    backgroundColor: "#1A0E26",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  totalAssetsCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalAssetsLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  totalAssetsAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  walletAddressContainer: {
    marginTop: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 8,
  },
  walletAddressLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  walletAddress: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flex: 0.45,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionButton: {
    backgroundColor: "#8C5BE6",
  },
  secondaryActionButton: {
    backgroundColor: "#2E1A40",
    borderWidth: 1,
    borderColor: "#8C5BE6",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  cryptoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cryptoCard: {
    backgroundColor: "#2E1A40",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  cryptoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cryptoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(140, 91, 230, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cryptoIcon: {
    width: 24,
    height: 24,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  cryptoFullName: {
    fontSize: 14,
    color: "#9B86B3",
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  balanceUsd: {
    fontSize: 16,
    color: "#9B86B3",
    marginTop: 4,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(140, 91, 230, 0.2)",
  },
  priceText: {
    fontSize: 16,
    color: "#9B86B3",
  },
  changeText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positiveChange: {
    color: "#3DD598",
    backgroundColor: "rgba(61, 213, 152, 0.1)",
  },
  negativeChange: {
    color: "#F56565",
    backgroundColor: "rgba(245, 101, 101, 0.1)",
  },
  neutralChange: {
    color: "#9B86B3",
    backgroundColor: "rgba(155, 134, 179, 0.1)",
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E1A40",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.2)",
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  receiveIcon: {
    backgroundColor: "rgba(61, 213, 152, 0.2)",
  },
  sendIcon: {
    backgroundColor: "rgba(245, 101, 101, 0.2)",
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  transactionDate: {
    fontSize: 12,
    color: "#9B86B3",
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  receiveText: {
    color: "#3DD598",
  },
  sendText: {
    color: "#F56565",
  },
  transactionStatus: {
    fontSize: 12,
    color: "#9B86B3",
    marginTop: 2,
  },
  noTransactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  noTransactionsGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  noTransactionsImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#8C5BE6",
  },
  noTransactionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginBottom: 8,
    textAlign: "center",
  },
  noTransactionsText: {
    fontSize: 14,
    color: "#9B86B3",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: "#2E1A40",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
    maxHeight: "80%",
    minHeight: 530,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  swapFromContainer: {
    marginBottom: 16,
  },
  swapToContainer: {
    marginBottom: 16,
  },
  swapLabel: {
    fontSize: 16,
    color: "#9B86B3",
    marginBottom: 8,
  },
  swapInputContainer: {
    flexDirection: "row",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
    overflow: "hidden",
  },
  swapAmountInput: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  swapTokenSelector: {
    backgroundColor: "#3C2356",
    paddingHorizontal: 12,
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(140, 91, 230, 0.3)",
  },
  tokenSelectorInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  swapTokenIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  swapTokenText: {
    color: "#E0E0E0",
    fontWeight: "bold",
    marginRight: 6,
  },
  balanceText: {
    color: "#9B86B3",
    fontSize: 14,
    marginTop: 6,
  },
  swapArrowContainer: {
    alignItems: "center",
    marginVertical: 4,
  },
  swapArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
  },
  swapOutputContainer: {
    flexDirection: "row",
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 91, 230, 0.3)",
    overflow: "hidden",
  },
  estimatedAmountText: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  swapDetailsContainer: {
    backgroundColor: "#1A0E26",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  swapDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  swapDetailLabel: {
    color: "#9B86B3",
    fontSize: 14,
  },
  swapDetailValue: {
    color: "#E0E0E0",
    fontSize: 14,
  },
  slippageContainer: {
    flexDirection: "row",
  },
  slippageButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
    backgroundColor: "#3C2356",
  },
  slippageButtonActive: {
    backgroundColor: "#8C5BE6",
  },
  slippageButtonText: {
    color: "#E0E0E0",
    fontSize: 12,
  },
  swapProtocolContainer: {
    marginBottom: 20,
  },
  swapProtocolText: {
    color: "#9B86B3",
    fontSize: 14,
    textAlign: "center",
  },
  swapButton: {
    backgroundColor: "#8C5BE6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  swapButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  invalidInput: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  swapChainSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  swapChainLabel: {
    color: "#E0E0E0",
    fontSize: 14,
  },
  swapChainButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  swapChainIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  swapChainText: {
    color: "#E0E0E0",
    fontSize: 14,
    marginRight: 8,
  },
  maxButton: {
    color: "#8C5BE6",
    fontSize: 12,
    fontWeight: "bold",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tokenSelectModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  tokenSelectModalContainer: {
    backgroundColor: "#1A1A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  tokenSelectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0",
    marginBottom: 20,
    textAlign: "center",
  },
  tokenSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tokenSelectIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 14,
  },
  tokenSelectText: {
    fontSize: 16,
    color: "#E0E0E0",
    flex: 1,
  },
  tokenSelectBalance: {
    fontSize: 14,
    color: "#9B86B3",
  },
  tokenSelectCloseButton: {
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  tokenSelectCloseText: {
    fontSize: 16,
    color: "#8C5BE6",
    fontWeight: "600",
  },
  tokenListContainer: {
    maxHeight: 300,
  },
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
    color: "#9B86B3",
  },

  tokenSelectItemActive: {
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    borderRadius: 8,
  },
  noTokensFound: {
    color: "#9B86B3",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  commonTokensContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    marginTop: 8,
  },
  commonTokenChip: {
    backgroundColor: "rgba(140, 91, 230, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  commonTokenChipText: {
    color: "#E0E0E0",
    fontSize: 14,
    marginLeft: 4,
  },
  commonTokenChipIcon: {
    width: 16,
    height: 16,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    position: "absolute",
    top: 150, // adjust this depending on where your selector is
    left: 20,
    right: 20,
    zIndex: 100,
    elevation: 10,
    maxHeight: 300,
  },
  dropdownSearchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownBalance: {
    fontSize: 14,
    color: "#666",
  },
});

export default Wallet;
