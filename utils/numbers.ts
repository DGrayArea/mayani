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

export const getAcronym = (name: string) => {
  const words = name.split(" ");
  let acronym = words.map((word) => word[0]).join("");
  if (acronym.length > 5) {
    acronym = acronym.slice(0, 5);
  }
  return acronym;
};

export const getRelativeTime = (deployedAt: string) => {
  const now = new Date();
  const deployed = new Date(deployedAt);
  const diffInMs = now.getTime() - deployed.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;
  const diffInMonths = diffInDays / 30;

  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (diffInMonths < 12) {
    const months = Math.floor(diffInMonths);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
};
