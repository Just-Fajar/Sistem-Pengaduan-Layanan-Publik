import { useCallback, useEffect, useState } from 'react';
import api from '../utils/axios';

/**
 * useCategories hook to fetch categories list
 * @returns {{ categories: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

export default useCategories;
