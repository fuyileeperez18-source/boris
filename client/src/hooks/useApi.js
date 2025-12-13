import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar llamadas a la API
 * con estados de loading, error y data
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      const result = response.data.data;
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
};

/**
 * Hook para manejar fetch con estado inicial
 */
export const useFetch = (apiFunction, initialFetch = false, initialArgs = []) => {
  const { data, error, loading, execute, reset } = useApi(apiFunction);

  // Ejecutar fetch inicial si se especifica
  useState(() => {
    if (initialFetch) {
      execute(...initialArgs);
    }
  });

  return {
    data,
    error,
    loading,
    refetch: execute,
    reset,
  };
};

export default useApi;
