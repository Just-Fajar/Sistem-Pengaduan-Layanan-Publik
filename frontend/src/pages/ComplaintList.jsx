import { useEffect, useState } from 'react';
import { FiEye, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/axios';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  useEffect(() => {
    fetchComplaints();
  }, [pagination.currentPage, statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await api.get('/complaints', { params });
      const paginationData = response.data.data;
      const list = Array.isArray(paginationData) ? paginationData : (paginationData?.data || []);
      setComplaints(list);
      setPagination(prev => ({
        ...prev,
        totalPages: paginationData?.total_pages || 1,
        totalItems: paginationData?.total_rows ?? list.length
      }));
    } catch (error) {
      toast.error('Gagal memuat data pengaduan');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Pengaduan</h1>
            <p className="text-gray-600 mt-1">Total: {pagination.totalItems} pengaduan</p>
          </div>
          <Link to="/complaints/create" className="btn btn-primary">
            Buat Pengaduan Baru
          </Link>
        </div>

        {/* Filter */}
        <div className="card">
          <div className="flex items-center gap-4">
            <FiFilter className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Filter Status:</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleStatusFilterChange('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Menunggu
              </button>
              <button
                onClick={() => handleStatusFilterChange('processing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'processing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Diproses
              </button>
              <button
                onClick={() => handleStatusFilterChange('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Complaint List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">Tidak ada pengaduan</p>
              <Link to="/complaints/create" className="btn btn-primary">
                Buat Pengaduan
              </Link>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {complaint.category?.name} • {formatDate(complaint.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{complaint.description}</p>

                {complaint.photo_url && (
                  <div className="mb-4">
                    <img 
                      src={complaint.photo_url} 
                      alt="Foto pengaduan" 
                      className="h-48 w-full object-cover rounded-lg"
                    />
                  </div>
                )}

                {complaint.responses && complaint.responses.length > 0 && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Mendapat {complaint.responses.length} tanggapan dari admin
                    </p>
                  </div>
                )}

                <Link 
                  to={`/complaints/${complaint.id}`} 
                  className="btn btn-outline flex items-center justify-center gap-2 w-full"
                >
                  <FiEye /> Lihat Detail
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
};

export default ComplaintList;
