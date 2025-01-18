import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const withLoading = useCallback(async <T>(
    callback: () => Promise<T>,
    errorHandler?: (error: unknown) => void
  ): Promise<T | void> => {
    try {
      startLoading();
      return await callback();
    } catch (error) {
      errorHandler?.(error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};
