import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiFileText, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Layout from '../../components/Layout';
import api from '../../utils/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#FCD34D', '#60A5FA', '#34D399'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/statistics');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats ? [
    { name: 'Menunggu', value: stats.pending_complaints || 0 },
    { name: 'Diproses', value: stats.processing_complaints || 0 },
    { name: 'Selesai', value: stats.completed_complaints || 0 },
  ] : [];

  const categoryData = stats?.complaints_by_category?.map(cat => ({
    name: cat.category_name,
    pengaduan: cat.total,
  })) || [];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Selamat datang di panel administrator</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengaduan</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.total_complaints || 0}</p>
              </div>
              <FiFileText className="text-4xl text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="card bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pending_complaints || 0}</p>
              </div>
              <FiClock className="text-4xl text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="card bg-blue-50 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Diproses</p>
                <p className="text-3xl font-bold text-blue-700">{stats?.processing_complaints || 0}</p>
              </div>
              <FiFileText className="text-4xl text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{stats?.completed_complaints || 0}</p>
              </div>
              <FiCheckCircle className="text-4xl text-green-500 opacity-50" />
            </div>
          </div>

          <div className="card bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total User</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.total_users || 0}</p>
              </div>
              <FiUsers className="text-4xl text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/complaints?status=pending"
              className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-yellow-800 mb-2">Pengaduan Baru</h3>
              <p className="text-sm text-yellow-700">
                Ada {stats?.pending_complaints || 0} pengaduan menunggu ditangani
              </p>
            </a>

            <a
              href="/admin/complaints?status=processing"
              className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-blue-800 mb-2">Sedang Diproses</h3>
              <p className="text-sm text-blue-700">
                {stats?.processing_complaints || 0} pengaduan sedang ditangani
              </p>
            </a>

            <a
              href="/admin/complaints"
              className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-green-800 mb-2">Semua Pengaduan</h3>
              <p className="text-sm text-green-700">
                Lihat dan kelola semua pengaduan
              </p>
            </a>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Pengaduan</h2>
            {stats && stats.total_complaints > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Belum ada data pengaduan</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pengaduan per Kategori</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pengaduan" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Belum ada data kategori</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Kinerja</h2>
          <div className="space-y-4">
            {stats && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Tingkat Penyelesaian</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.total_complaints > 0 
                        ? Math.round((stats.completed_complaints / stats.total_complaints) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${stats.total_complaints > 0 
                          ? (stats.completed_complaints / stats.total_complaints) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Sedang Ditangani</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.total_complaints > 0 
                        ? Math.round((stats.processing_complaints / stats.total_complaints) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${stats.total_complaints > 0 
                          ? (stats.processing_complaints / stats.total_complaints) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
