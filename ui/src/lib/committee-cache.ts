export const CACHE_KEY_COMMITTEES = 'cached-committees';
export const CACHE_DURATION_MINUTES = 5;

export const clearCommitteeCache = (): boolean => {
  try {
    localStorage.removeItem(CACHE_KEY_COMMITTEES);
    return true;
  } catch (error) {
    console.warn('Failed to clear committee cache:', error);
    return false;
  }
};

export const getCommitteeCacheInfo = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_COMMITTEES);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const cacheAge = Date.now() - timestamp;
    const isExpired = cacheAge >= CACHE_DURATION_MINUTES * 60 * 1000;

    return {
      hasCache: true,
      cacheAge: Math.round(cacheAge / 1000),
      isExpired,
      itemCount: data?.length || 0,
      lastUpdated: new Date(timestamp).toISOString()
    };
  } catch (error) {
    console.warn('Failed to read committee cache info:', error);
    return { hasCache: false, error: true };
  }
};


