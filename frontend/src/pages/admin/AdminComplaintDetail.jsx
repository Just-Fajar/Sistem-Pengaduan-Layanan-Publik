import { useEffect, useState } from 'react';
import { FiArrowLeft, FiClock, FiSend, FiTag, FiUser } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/axios';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await api.get(`/admin/complaints/${id}`);
      setComplaint(response.data.data);
      setNewStatus(response.data.data.status);
    } catch (error) {
      toast.error('Gagal memuat detail pengaduan');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === complaint.status) {
      toast.info('Status tidak berubah');
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.put(`/admin/complaints/${id}/status`, { status: newStatus });
      toast.success('Status berhasil diupdate');
      fetchComplaintDetail();
    } catch (error) {
      toast.error('Gagal mengupdate status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      toast.error('Tanggapan tidak boleh kosong');
      return;
    }

    setSendingResponse(true);
    try {
      await api.post(`/admin/complaints/${id}/response`, {
        response_text: responseText,
      });
      toast.success('Tanggapan berhasil dikirim');
      setResponseText('');
      fetchComplaintDetail();
    } catch (error) {
      toast.error('Gagal mengirim tanggapan');
    } finally {
      setSendingResponse(false);
    }
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

  if (!complaint) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/complaints')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary"
        >
          <FiArrowLeft /> Kembali ke Daftar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiTag />
                      <span>{complaint.category?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock />
                      <span>{formatDate(complaint.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser />
                      <span>ID: #{complaint.id}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              {/* Photo */}
              {complaint.photo_url && (
                <div className="mb-6">
                  <img 
                    src={complaint.photo_url} 
                    alt="Foto pengaduan" 
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {/* User Info */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pelapor</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-medium text-gray-900">{complaint.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{complaint.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">No. Telepon</p>
                      <p className="font-medium text-gray-900">{complaint.user?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Laporan</p>
                      <p className="font-medium text-gray-900">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Riwayat Tanggapan ({complaint.responses?.length || 0})
              </h2>
              
              {complaint.responses && complaint.responses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {complaint.responses.map((response) => (
                    <div key={response.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                            {response.admin?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{response.admin?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-600">{formatDate(response.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 ml-10">{response.response_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 mb-6">Belum ada tanggapan</p>
              )}

              {/* Add Response Form */}
              <form onSubmit={handleSendResponse} className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambah Tanggapan
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="input mb-3"
                  placeholder="Tulis tanggapan Anda untuk pengaduan ini..."
                  required
                />
                <button
                  type="submit"
                  disabled={sendingResponse}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FiSend /> {sendingResponse ? 'Mengirim...' : 'Kirim Tanggapan'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Status */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Saat Ini
                  </label>
                  <StatusBadge status={complaint.status} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubah Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="processing">Diproses</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === complaint.status}
                  className="w-full btn btn-primary"
                >
                  {updatingStatus ? 'Mengupdate...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="card bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-3">Panduan</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>Menunggu:</strong> Pengaduan baru masuk</li>
                <li>• <strong>Diproses:</strong> Sedang ditangani</li>
                <li>• <strong>Selesai:</strong> Pengaduan selesai</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminComplaintDetail;
