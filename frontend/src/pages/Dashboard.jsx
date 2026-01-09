import { useEffect, useState } from 'react';
import { FiEye, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/axios';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });

  const COLORS = ['#FCD34D', '#60A5FA', '#34D399'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints?pageSize=100');
      const data = response.data.data;
      setComplaints(data.slice(0, 5)); // Show only 5 recent
      
      // Calculate stats
      setStats({
        total: response.data.totalItems || data.length,
        pending: data.filter(c => c.status === 'pending').length,
        processing: data.filter(c => c.status === 'processing').length,
        completed: data.filter(c => c.status === 'completed').length,
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
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Kelola pengaduan Anda</p>
          </div>
          <Link to="/complaints/create" className="btn btn-primary flex items-center gap-2">
            <FiPlus /> Buat Pengaduan
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Pengaduan</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="card bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Menunggu</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="card bg-blue-50 border-l-4 border-blue-600">
            <p className="text-sm text-gray-600">Diproses</p>
            <p className="text-3xl font-bold text-blue-700">{stats.processing}</p>
          </div>
          <div className="card bg-green-50 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Selesai</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Chart */}
        {stats.total > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Pengaduan</h2>
            <ResponsiveContainer width="100%" height={300}>
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
          </div>
        )}

        {/* Recent Complaints */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pengaduan Terbaru</h2>
          
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Belum ada pengaduan</p>
              <Link to="/complaints/create" className="btn btn-primary">
                Buat Pengaduan Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {complaint.category?.name} • {formatDate(complaint.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">{complaint.description}</p>
                  {complaint.responses && complaint.responses.length > 0 && (
                    <p className="text-xs text-green-600 mb-2">
                      ✓ {complaint.responses.length} Tanggapan dari Admin
                    </p>
                  )}
                  <Link 
                    to={`/complaints/${complaint.id}`} 
                    className="text-primary text-sm hover:underline flex items-center gap-1"
                  >
                    <FiEye /> Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          )}

          {stats.total > 5 && (
            <div className="mt-4 text-center">
              <Link to="/complaints" className="text-primary hover:underline">
                Lihat Semua Pengaduan →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
