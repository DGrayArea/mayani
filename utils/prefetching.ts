import { QueryClient } from '@tanstack/react-query';
import { fetchTrending, fetchPumpShots, fetchMarketData, fetchTokenDetails } from './query';

/**
 * Prefetches essential app data for improved UX
 * @param queryClient The React Query client instance
 */
export async function prefetchAppData(queryClient: QueryClient): Promise<void> {
  try {
    // Prefetch trending data
    await queryClient.prefetchQuery({
      queryKey: ['trending'],
      queryFn: fetchTrending,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Prefetch new listings 
    await queryClient.prefetchQuery({
      queryKey: ['newListings'],
      queryFn: fetchPumpShots,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Prefetch market data
    await queryClient.prefetchQuery({
      queryKey: ['marketData', '24h'],
      queryFn: () => fetchMarketData('24h'),
      staleTime: 1000 * 60 * 15, // 15 minutes
    });

    console.log('App data prefetched successfully');
  } catch (error) {
    console.error('Error prefetching app data:', error);
  }
}

/**
 * Prefetches token details for a specific token
 * This can be called when navigating to a token page or for anticipating user navigation
 */
export async function prefetchTokenDetails(
  queryClient: QueryClient,
  tokenId: string,
  chain: 'SOL' | 'ETH'
): Promise<void> {
  try {
    await queryClient.prefetchQuery({
      queryKey: ['token', chain, tokenId],
      queryFn: () => fetchTokenDetails(tokenId, chain),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  } catch (error) {
    console.error(`Error prefetching token details for ${chain}:${tokenId}:`, error);
  }
}

/**
 * Warm up the cache by prefetching 24h, 7d and 30d data for a token
 */
export async function prefetchTokenTimeframes(
  queryClient: QueryClient,
  tokenId: string,
  chain: 'SOL' | 'ETH'
): Promise<void> {
  const timeframes = ['24h', '7d', '30d'] as const;
  
  try {
    await Promise.all(
      timeframes.map((timeframe) =>
        queryClient.prefetchQuery({
          queryKey: ['token', chain, tokenId, 'chart', timeframe],
          queryFn: () => fetchMarketData(timeframe),
          staleTime: 1000 * 60 * 5, // 5 minutes
        })
      )
    );
  } catch (error) {
    console.error(`Error prefetching timeframe data for ${chain}:${tokenId}:`, error);
  }
} 