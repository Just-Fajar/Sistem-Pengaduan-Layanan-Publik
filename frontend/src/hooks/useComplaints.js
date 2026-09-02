import { useCallback, useEffect, useState } from 'react';
import api from '../utils/axios';

/**
 * useComplaints hook for managing user complaints list, filter, and pagination
 * @param {object} initialParams 
 * @returns {object} complaints, pagination, loading, error, refetch, setPage, setStatus
 */
export function useComplaints(initialParams = {}) {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState(initialParams.status || '');
  const [page, setPage] = useState(initialParams.page || 1);
  const [pageSize, setPageSize] = useState(initialParams.pageSize || 10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRows: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (status && status !== 'all') {
        params.status = status;
      }

      const response = await api.get('/complaints', { params });
      const data = response.data.data;

      if (data && Array.isArray(data.items)) {
        setComplaints(data.items);
        setPagination({
          page: data.page,
          pageSize: data.page_size,
          totalRows: data.total_rows,
          totalPages: data.total_pages,
        });
      } else if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pengaduan');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to page 1 on filter change
  };

  return {
    complaints,
    pagination,
    loading,
    error,
    status,
    setStatus: handleStatusChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch: fetchComplaints,
  };
}

export default useComplaints;
