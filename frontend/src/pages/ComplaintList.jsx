import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCalendar,
  FiFileText,
  FiFilter,
  FiInbox,
  FiMessageSquare,
  FiPlus,
  FiTag
} from 'react-icons/fi';
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
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Riwayat Pengaduan
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {pagination.totalItems} Laporan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh aspirasi dan laporan kendala yang telah Anda sampaikan.
            </p>
          </div>
          <Link to="/complaints/create" className="btn btn-primary text-xs">
            <FiPlus className="w-4 h-4" />
            Buat Pengaduan Baru
          </Link>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="card p-3 bg-white shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 pl-2 flex items-center gap-1.5 shrink-0">
              <FiFilter className="w-3.5 h-3.5" />
              Status:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'pending', label: 'Menunggu' },
                { key: 'processing', label: 'Diproses' },
                { key: 'completed', label: 'Selesai' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusFilterChange(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Memuat riwayat laporan...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center bg-white shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <FiInbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada pengaduan ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              {statusFilter === 'all'
                ? 'Anda belum memiliki laporan pengaduan.'
                : `Tidak ada laporan dengan status "${statusFilter}".`}
            </p>
            <Link to="/complaints/create" className="btn btn-primary text-xs">
              <FiPlus className="w-4 h-4" />
              Buat Pengaduan Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="card card-hover p-5 bg-white shadow-soft transition-all space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FiTag className="w-3 h-3" />
                        {complaint.category?.name || 'Umum'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(complaint.created_at)}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {complaint.title}
                    </h2>
                  </div>
                  <div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {complaint.description}
                </p>

                {complaint.photo_url && (
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={complaint.photo_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  {complaint.responses && complaint.responses.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      <FiMessageSquare className="w-3.5 h-3.5" />
                      {complaint.responses.length} Tanggapan Resmi Petugas
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Menunggu tanggapan verifikator
                    </span>
                  )}

                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 group"
                  >
                    Lihat Rincian
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
