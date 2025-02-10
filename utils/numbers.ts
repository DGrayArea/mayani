export function formatNumber(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + "T"; // Trillion
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B"; // Billion
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M"; // Million
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K"; // Thousand
  } else {
    return num.toString(); // No formatting needed for small numbers
  }
}

export const formatPrice = (price: number | string) => {
  if (typeof price !== "number" && typeof price !== "string") {
    return "0";
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    return "0";
  }

  // Handle zero case
  if (numPrice === 0) {
    return "0";
  }

  // Convert to string and remove leading zeros
  let priceStr = numPrice.toString();

  // Find first non-zero digit after decimal
  const decimalIndex = priceStr.indexOf(".");
  let integerPart = priceStr;
  let decimalPart = "";

  if (decimalIndex !== -1) {
    integerPart = priceStr.slice(0, decimalIndex);
    decimalPart = priceStr.slice(decimalIndex);
  }

  // Add commas to the integer part
  const formattedIntegerPart = Number(integerPart).toLocaleString();

  // Handle the decimal part
  if (decimalPart) {
    let firstNonZeroIndex = 1; // Start after the decimal point
    while (
      firstNonZeroIndex < decimalPart.length &&
      decimalPart[firstNonZeroIndex] === "0"
    ) {
      firstNonZeroIndex++;
    }

    // Keep original number of zeros plus 2 significant digits
    const significantDigits = 2;
    const zerosCount = firstNonZeroIndex - 1;
    const endIndex = firstNonZeroIndex + significantDigits;

    decimalPart = decimalPart.slice(0, Math.min(endIndex, decimalPart.length));
  }

  return formattedIntegerPart + decimalPart;
};
