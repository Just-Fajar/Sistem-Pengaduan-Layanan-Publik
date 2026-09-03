import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiRotateCcw,
  FiSearch,
  FiTag
} from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../utils/axios';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category_id: '',
    search: '',
    date_from: '',
    date_to: '',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

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
  }, [debouncedSearch, filters.status, filters.category_id, filters.date_from, filters.date_to, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
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
        ...filters,
        search: debouncedSearch,
      };
      
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

  const handleResetFilter = () => {
    setFilters({
      status: '',
      category_id: '',
      search: '',
      date_from: '',
      date_to: '',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExportPDF = async () => {
    setExporting(true);
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
      link.setAttribute('download', `laporan_pengaduan_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Laporan PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor laporan ke PDF');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Kelola Pengaduan
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {pagination.totalItems} Laporan Masuk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi laporan, tugaskan tim dinas, ubah status penanganan, dan berikan tanggapan resmi.
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="btn btn-outline text-xs self-start sm:self-auto"
          >
            <FiDownload className="w-4 h-4 text-indigo-600" />
            {exporting ? 'Mengunduh...' : 'Ekspor Rekap PDF'}
          </button>
        </div>

        {/* Filters Card */}
        <div className="card p-5 bg-white shadow-soft space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Cari Kata Kunci
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul atau isi pengaduan..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Status Aduan
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input text-xs cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="processing">Sedang Diproses</option>
                <option value="completed">Selesai Ditangani</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Kategori Layanan
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="input text-xs cursor-pointer"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100 items-end">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="input text-xs"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleResetFilter}
                className="btn btn-subtle w-full text-xs"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                Reset Semua Filter
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table Card */}
        <div className="card p-0 bg-white shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner message="Memuat tabel pengaduan..." />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm font-semibold text-slate-700">Tidak ada pengaduan yang sesuai filter</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau reset filter di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Judul & Kategori
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Pelapor
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-400">
                        #{complaint.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {complaint.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FiTag className="w-3 h-3 text-slate-400" />
                          {complaint.category?.name || 'Umum'}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {complaint.user?.name ? complaint.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-tight">
                              {complaint.user?.name || 'Anonim'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {complaint.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(complaint.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <Link
                          to={`/admin/complaints/${complaint.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Tindak Lanjut
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
