import { useEffect, useState } from 'react';
import { FiFilter, FiSearch, FiDownload, FiCalendar } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import api from '../../utils/axios';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category_id: '',
    search: '',
    date_from: '',
    date_to: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.get('/admin/complaints', { params });
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

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleExportPDF = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const response = await api.get('/admin/export/complaints/pdf', {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pengaduan_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data berhasil diekspor ke PDF');
    } catch (error) {
      toast.error('Gagal mengekspor data');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pengaduan</h1>
            <p className="text-gray-600 mt-1">Total: {pagination.totalItems} pengaduan</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="btn btn-success flex items-center gap-2"
          >
            <FiDownload /> Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiSearch className="inline mr-1" /> Cari
              </label>
              <input
                type="text"
                placeholder="Cari judul atau deskripsi..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFilter className="inline mr-1" /> Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFilter className="inline mr-1" /> Kategori
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="input"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" /> Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" /> Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ status: '', category_id: '', search: '', date_from: '', date_to: '' })}
              className="btn btn-outline"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Complaint Table */}
        <div className="card overflow-x-auto">
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Tidak ada pengaduan ditemukan
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul & Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{complaint.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                      <div className="text-sm text-gray-500">{complaint.category?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{complaint.user?.name}</div>
                      <div className="text-sm text-gray-500">{complaint.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(complaint.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/complaints/${complaint.id}`}
                        className="text-primary hover:text-blue-700 font-medium"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AdminComplaints;
