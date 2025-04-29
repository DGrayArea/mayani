export const config = {
  platform: "com.gray.mayani",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  infuraId: process.env.EXPO_PUBLIC_INFURA_ID,
  alchemyTransport: process.env.EXPO_PUBLIC_ALCEMY_ID,
  moralisKey: process.env.EXPO_PUBLIC_MORALIS_KEY,
  apiEndpoint: process.env.EXPO_PUBLIC_API_ENDPOINT,
  zeroExApiKey: process.env.EXPO_PUBLIC_ZEROEX_API_KEY,
  jupiterRelay: process.env.EXPO_PUBLIC_JUPITER_RELAY,
  zeroExRelay: process.env.EXPO_PUBLIC_ZEROEX_RELAY,
  heliusUrl: process.env.EXPO_PUBLIC_HELIUS_URL,
  helius2Url: process.env.EXPO_PUBLIC_HELIUS2_URL,
};
