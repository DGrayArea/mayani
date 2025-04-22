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

export { waitForTransaction };
