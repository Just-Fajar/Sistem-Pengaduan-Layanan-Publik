import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInbox,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });

  const CHART_COLORS = ['#F59E0B', '#6366F1', '#10B981'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints?page_size=100');
      const paginationData = response.data.data;
      const list = Array.isArray(paginationData) ? paginationData : (paginationData?.data || []);
      const total = paginationData?.total_rows ?? list.length;

      setComplaints(list.slice(0, 5));
      
      setStats({
        total: total,
        pending: list.filter(c => c.status === 'pending').length,
        processing: list.filter(c => c.status === 'processing').length,
        completed: list.filter(c => c.status === 'completed').length,
      });
    } catch (error) {
      toast.error('Gagal memuat data pengaduan');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Menunggu', value: stats.pending },
    { name: 'Diproses', value: stats.processing },
    { name: 'Selesai', value: stats.completed },
  ].filter(item => item.value > 0);

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
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat data dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Panel Pengguna
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              Halo, {user?.name || 'Warga'} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau status penanganan aspirasi dan laporan layanan publik Anda secara real-time.
            </p>
          </div>
          <div>
            <Link
              to="/complaints/create"
              className="btn btn-primary px-5 py-3 shadow-md shadow-indigo-500/20"
            >
              <FiPlus className="w-4 h-4" />
              <span>Buat Pengaduan Baru</span>
            </Link>
          </div>
        </div>

        {/* Minimalist Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total */}
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Laporan</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-1">Aduan tercatat</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
            </div>
          </div>

          {/* Menunggu */}
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Menunggu</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1.5">{stats.pending}</p>
              <p className="text-[11px] text-amber-600/80 mt-1">Dalam antrean verifikasi</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiClock className="w-6 h-6" />
            </div>
          </div>

          {/* Diproses */}
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diproses</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-1.5">{stats.processing}</p>
              <p className="text-[11px] text-indigo-600/80 mt-1">Sedang ditindaklanjuti</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiRefreshCw className="w-6 h-6" />
            </div>
          </div>

          {/* Selesai */}
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selesai</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">{stats.completed}</p>
              <p className="text-[11px] text-emerald-600/80 mt-1">Laporan terselesaikan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Complaints Feed (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Pengaduan Terkini
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan aduan yang baru-baru ini Anda ajukan
                </p>
              </div>
              {stats.total > 0 && (
                <Link
                  to="/complaints"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Lihat Semua ({stats.total})
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {complaints.length === 0 ? (
              <div className="card p-12 text-center bg-white">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Belum Ada Pengaduan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
                  Anda belum pernah mengajukan pengaduan layanan publik. Sampaikan aspirasi atau keluhan Anda untuk perbaikan fasilitas bersama.
                </p>
                <Link to="/complaints/create" className="btn btn-primary text-xs">
                  <FiPlus className="w-4 h-4" />
                  Mulai Buat Pengaduan Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    to={`/complaints/${complaint.id}`}
                    className="card card-hover p-5 block group bg-white"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.category?.name || 'Umum'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {formatDate(complaint.created_at)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {complaint.title}
                        </h3>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {complaint.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      {complaint.responses && complaint.responses.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                          <FiMessageSquare className="w-3.5 h-3.5" />
                          {complaint.responses.length} Tanggapan Resmi
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Belum ada tanggapan petugas
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        Lihat Detail
                        <FiArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Side Overview / Chart Card (1 Column) */}
          <div className="space-y-4">
            <div className="card p-6 bg-white">
              <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
                Distribusi Status
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Proporsi penanganan seluruh laporan Anda
              </p>

              {chartData.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400">
                  <FiClock className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">Data statistik belum tersedia</p>
                </div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Information Card */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border-indigo-100">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                Panduan Pengaduan
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Sertakan deskripsi jelas lokasi dan rincian masalah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Unggah foto pendukung untuk mempercepat proses verifikasi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Petugas akan memberikan update status dan respon tertulis.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
