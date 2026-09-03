import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiFolder,
  FiInbox,
  FiRefreshCw,
  FiUsers
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const PIE_COLORS = ['#F59E0B', '#6366F1', '#10B981'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/statistics');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat data analitik administrator');
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats
    ? [
        { name: 'Menunggu', value: stats.pending_complaints || 0 },
        { name: 'Diproses', value: stats.processing_complaints || 0 },
        { name: 'Selesai', value: stats.completed_complaints || 0 },
      ].filter((item) => item.value > 0)
    : [];

  const categoryData =
    stats?.complaints_by_category?.map((cat) => ({
      name: cat.category_name,
      pengaduan: cat.total,
    })) || [];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat data analitik sistem...</p>
        </div>
      </Layout>
    );
  }

  const completionRate =
    stats?.total_complaints > 0
      ? Math.round((stats.completed_complaints / stats.total_complaints) * 100)
      : 0;

  const inProgressRate =
    stats?.total_complaints > 0
      ? Math.round((stats.processing_complaints / stats.total_complaints) * 100)
      : 0;

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Panel Pengelola
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              Dashboard Administrator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ikhtisar metrik layanan, pemantauan pengaduan masyarakat, dan progres tindak lanjut.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/admin/complaints" className="btn btn-primary text-xs">
              <FiInbox className="w-4 h-4" />
              Kelola Pengaduan
            </Link>
            <Link to="/admin/categories" className="btn btn-outline text-xs">
              <FiFolder className="w-4 h-4" />
              Kategori
            </Link>
          </div>
        </div>

        {/* 5-Grid Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Pengaduan */}
          <div className="card card-hover p-5 bg-white shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Aduan</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{stats?.total_complaints || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Keseluruhan</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FiFileText className="w-5 h-5" />
            </div>
          </div>

          {/* Menunggu */}
          <div className="card card-hover p-5 bg-white shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Menunggu</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1.5">{stats?.pending_complaints || 0}</p>
              <p className="text-[11px] text-amber-600/80 mt-0.5">Perlu verifikasi</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiClock className="w-5 h-5" />
            </div>
          </div>

          {/* Diproses */}
          <div className="card card-hover p-5 bg-white shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diproses</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-1.5">{stats?.processing_complaints || 0}</p>
              <p className="text-[11px] text-indigo-600/80 mt-0.5">Penanganan tim</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiRefreshCw className="w-5 h-5" />
            </div>
          </div>

          {/* Selesai */}
          <div className="card card-hover p-5 bg-white shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selesai</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">{stats?.completed_complaints || 0}</p>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">Terselesaikan</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Total Pengguna */}
          <div className="card card-hover p-5 bg-white shadow-soft flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total User</p>
              <p className="text-3xl font-extrabold text-violet-600 mt-1.5">{stats?.total_users || 0}</p>
              <p className="text-[11px] text-violet-600/80 mt-0.5">Masyarakat terdaftar</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/complaints?status=pending"
            className="card p-5 bg-white hover:border-amber-300 hover:shadow-card-hover transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Aduan Baru Masuk
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <strong className="text-amber-700 font-bold">{stats?.pending_complaints || 0}</strong> aduan perlu ditinjau segera
              </p>
            </div>
            <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/complaints?status=processing"
            className="card p-5 bg-white hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Dalam Penanganan
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <strong className="text-indigo-700 font-bold">{stats?.processing_complaints || 0}</strong> aduan sedang dikerjakan dinas
              </p>
            </div>
            <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/complaints"
            className="card p-5 bg-white hover:border-slate-300 hover:shadow-card-hover transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                  Semua Arsip Pengaduan
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lihat daftar tabel, filter per tanggal, dan cetak PDF
              </p>
            </div>
            <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="card p-6 bg-white shadow-soft">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Distribusi Status Pengaduan
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Perbandingan proporsi laporan berdasarkan tahapan proses
            </p>

            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <FiClock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Belum ada data pengaduan masuk</p>
              </div>
            )}
          </div>

          {/* By Category */}
          <div className="card p-6 bg-white shadow-soft">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Aduan Berdasarkan Kategori
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Volume laporan masyarakat pada masing-masing bidang layanan
            </p>

            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Bar dataKey="pengaduan" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <FiFolder className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Belum ada statistik kategori</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview Bars */}
        <div className="card p-6 bg-white shadow-soft space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Tingkat Kinerja & Penyelesaian Pelayanan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Tingkat Penyelesaian (Selesai)</span>
                <span className="font-bold text-emerald-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Tingkat Penanganan Aktif (Diproses)</span>
                <span className="font-bold text-indigo-600">{inProgressRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${inProgressRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
