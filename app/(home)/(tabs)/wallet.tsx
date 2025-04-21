import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReceiveModal from "@/components/dialog/ReceiveModal";
import SendModal from "@/components/dialog/SendModal";
import useWalletStore from "@/hooks/walletStore";
import images from "@/constants/images";
import ChainSelector from "@/components/ChainSelector";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

const Wallet = () => {
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFromCrypto, setSwapFromCrypto] = useState("eth");
  const [swapToCrypto, setSwapToCrypto] = useState("usdt");
  const [slippage, setSlippage] = useState("0.5");
  const [estimatedReceived, setEstimatedReceived] = useState("0");
  const [walletData, setWalletData] = useState({
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
  const [transactions, setTransactions] = useState<any>([]);

  const {
    solWalletAddress,
    ethWalletAddress,
    generateSolWallet,
    generateEthWallet,
    currentChain,
    switchChain,
  } = useWalletStore();

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
    calculateEstimatedReceived();
  }, [swapAmount, swapFromCrypto, swapToCrypto]);

  const truncateAddress = (address) => {
    // if (!address || address.length <= 10) return address;
    // return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return address;
  };

  const fetchWalletData = async () => {
    // In a real app, we would fetch real balance data here
    // Simulating API call with timeout
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

  const calculateEstimatedReceived = () => {
    if (
      !swapAmount ||
      isNaN(Number(swapAmount)) ||
      parseFloat(swapAmount) <= 0
    ) {
      setEstimatedReceived("0");
      return;
    }

    const fromPrice = walletData[swapFromCrypto].price;
    const toPrice = walletData[swapToCrypto].price;

    const valueInUsd = parseFloat(swapAmount) * fromPrice;
    const estimatedAmount = valueInUsd / toPrice;

    // Apply a fee (different for ETH and SOL)
    let feePercentage = 0;
    if (swapFromCrypto === "eth" && swapToCrypto === "usdt") {
      feePercentage = 0.003; // 0.3% for ETH to USDT
    } else if (swapFromCrypto === "sol" && swapToCrypto === "usdt") {
      feePercentage = 0.001; // 0.1% for SOL to USDT
    } else {
      feePercentage = 0.005; // 0.5% for other swaps
    }

    const afterFee = estimatedAmount * (1 - feePercentage);
    setEstimatedReceived(afterFee.toFixed(6));
  };

  const handleSwap = () => {
    if (
      !swapAmount ||
      isNaN(Number(swapAmount)) ||
      parseFloat(swapAmount) <= 0
    ) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to swap");
      return;
    }

    if (parseFloat(swapAmount) > walletData[swapFromCrypto].balance) {
      Alert.alert(
        "Insufficient Balance",
        `Not enough ${swapFromCrypto.toUpperCase()} in your wallet`
      );
      return;
    }

    // Simulate swap process
    Alert.alert("Swap Initiated", "Processing your swap...");

    setTimeout(() => {
      // Implementation would be different based on chain
      let swapMethod = "";
      if (swapFromCrypto === "eth" && swapToCrypto === "usdt") {
        swapMethod = "Using Uniswap protocol for ETH swap";
      } else if (swapFromCrypto === "sol" && swapToCrypto === "usdt") {
        swapMethod = "Using Raydium protocol for SOL swap";
      } else {
        swapMethod = "Using default DEX protocol";
      }

      // Update wallet balances (in a real app, this would happen after confirmation)
      const updatedWalletData = { ...walletData };
      updatedWalletData[swapFromCrypto].balance -= parseFloat(swapAmount);
      updatedWalletData[swapToCrypto].balance += parseFloat(estimatedReceived);
      setWalletData(updatedWalletData);

      // Add transaction to history
      const newTransaction = {
        id: Date.now().toString(),
        type: "swap",
        symbol: `${swapFromCrypto.toUpperCase()} → ${swapToCrypto.toUpperCase()}`,
        amount: swapAmount,
        receivedAmount: estimatedReceived,
        date: new Date().toLocaleDateString(),
        status: "Completed",
        method: swapMethod,
      };

      setTransactions([newTransaction, ...transactions]);
      setSwapModalVisible(false);
      setSwapAmount("");

      Alert.alert(
        "Swap Successful",
        `Successfully swapped ${swapAmount} ${swapFromCrypto.toUpperCase()} to ${estimatedReceived} ${swapToCrypto.toUpperCase()}\n\n${swapMethod}`
      );
    }, 2000);
  };

  const calculateTotalAssets = () => {
    const ethValue = walletData.eth.balance * walletData.eth.price;
    const solValue = walletData.sol.balance * walletData.sol.price;
    const usdtValue = walletData.usdt.balance * walletData.usdt.price;
    return (ethValue + solValue + usdtValue).toFixed(2);
  };

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

  const CryptoCard = ({ crypto, data }) => {
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
              {icon ? (
                <Image source={icon} style={styles.cryptoIcon} />
              ) : (
                <FontAwesome name="dollar" size={20} color="#26A17B" />
              )}
            </View>
            <View>
              <Text style={styles.cryptoName}>{crypto.toUpperCase()}</Text>
              <Text style={styles.cryptoFullName}>{fullName}</Text>
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
            {data.balance.toFixed(4)} {crypto.toUpperCase()}
          </Text>
          <Text style={styles.balanceUsd}>
            ${(data.balance * data.price).toFixed(2)}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>${data.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.changeText,
              data.change.includes("+")
                ? styles.positiveChange
                : data.change === "0.0%"
                  ? styles.neutralChange
                  : styles.negativeChange,
            ]}
          >
            {data.change}
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

  const renderSwapModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={swapModalVisible}
      onRequestClose={() => setSwapModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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
                style={styles.swapAmountInput}
                value={swapAmount}
                onChangeText={setSwapAmount}
                placeholder="0.0"
                placeholderTextColor="#9B86B3"
                keyboardType="decimal-pad"
              />
              <View style={styles.swapTokenSelector}>
                <View style={styles.tokenSelectorInner}>
                  {currentChain === "ETH" ? (
                    <Image source={images.eth1} style={styles.swapTokenIcon} />
                  ) : currentChain === "SOL" ? (
                    <Image source={images.sol1} style={styles.swapTokenIcon} />
                  ) : (
                    <FontAwesome name="dollar" size={16} color="#26A17B" />
                  )}
                  <Text style={styles.swapTokenText}>
                    {currentChain.toUpperCase()}
                  </Text>
                  <FontAwesome name="angle-down" size={16} color="#9B86B3" />
                </View>
              </View>
            </View>
            <Text style={styles.balanceText}>
              Balance: {walletData[swapFromCrypto].balance.toFixed(4)}{" "}
              {currentChain.toUpperCase()}
            </Text>
          </View>

          <View style={styles.swapArrowContainer}>
            <TouchableOpacity
              style={styles.swapArrowButton}
              // onPress={() => {
              //   const temp = currentChain;
              //   setSwapFromCrypto(currentChain);
              //   setSwapToCrypto(temp);
              // }}
            >
              <FontAwesome name="exchange" size={20} color="#8C5BE6" />
            </TouchableOpacity>
          </View>

          <View style={styles.swapToContainer}>
            <Text style={styles.swapLabel}>To</Text>
            <View style={styles.swapOutputContainer}>
              <Text style={styles.estimatedAmountText}>
                {estimatedReceived}
              </Text>
              <View style={styles.swapTokenSelector}>
                <View style={styles.tokenSelectorInner}>
                  {swapToCrypto === "eth" ? (
                    <Image source={images.eth1} style={styles.swapTokenIcon} />
                  ) : swapToCrypto === "sol" ? (
                    <Image source={images.sol1} style={styles.swapTokenIcon} />
                  ) : (
                    <FontAwesome
                      name="dollar"
                      size={16}
                      color="#26A17B"
                      className="mr-1"
                    />
                  )}
                  <Text style={styles.swapTokenText}>
                    {swapToCrypto.toUpperCase()}
                  </Text>
                  <FontAwesome name="angle-down" size={16} color="#9B86B3" />
                </View>
              </View>
            </View>
            <Text style={styles.balanceText}>
              Balance: {walletData[swapToCrypto].balance.toFixed(4)}{" "}
              {swapToCrypto.toUpperCase()}
            </Text>
          </View>

          <View style={styles.swapDetailsContainer}>
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Rate</Text>
              <Text style={styles.swapDetailValue}>
                1 {currentChain.toUpperCase()} ≈{" "}
                {(
                  walletData[currentChain.toLocaleLowerCase()].price /
                  walletData[swapToCrypto].price
                ).toFixed(6)}{" "}
                {swapToCrypto.toUpperCase()}
              </Text>
            </View>
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Fee</Text>
              <Text style={styles.swapDetailValue}>
                {swapFromCrypto === "eth" && swapToCrypto === "usdt"
                  ? "0.3%"
                  : swapFromCrypto === "sol" && swapToCrypto === "usdt"
                    ? "0.1%"
                    : "0.5%"}
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
              {currentChain === "ETH" && swapToCrypto === "usdt"
                ? "Using Uniswap protocol for ETH ↔ USDT"
                : currentChain === "SOL" && swapToCrypto === "usdt"
                  ? "Using Jupiter protocol for SOL ↔ USDT"
                  : "Using optimal DEX routing"}
            </Text>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
            <Text style={styles.swapButtonText}>Swap Tokens</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
          <Text style={styles.totalAssetsAmount}>
            ${calculateTotalAssets()}
          </Text>
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
          <>
            {currentChain === "ETH" ? (
              <CryptoCard crypto="eth" data={walletData.eth} />
            ) : null}
          </>
          <>
            {currentChain === "SOL" ? (
              <CryptoCard crypto="sol" data={walletData.sol} />
            ) : null}
          </>

          <CryptoCard crypto="usdt" data={walletData.usdt} />
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
        {renderSwapModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  closeButton: {
    padding: 8,
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
});

export default Wallet;
