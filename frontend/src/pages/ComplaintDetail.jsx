import { useEffect, useState } from 'react';
import { FiArrowLeft, FiClock, FiTag, FiUser } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../utils/axios';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetail();
  }, [id]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat detail pengaduan');
      navigate('/complaints');
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary"
        >
          <FiArrowLeft /> Kembali
        </button>

        {/* Main Card */}
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

          {/* Status Timeline */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Pengaduan</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  complaint.status === 'pending' || complaint.status === 'processing' || complaint.status === 'completed'
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pengaduan Dibuat</p>
                  <p className="text-sm text-gray-600">{formatDate(complaint.created_at)}</p>
                </div>
              </div>
              
              {(complaint.status === 'processing' || complaint.status === 'completed') && (
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    complaint.status === 'processing' || complaint.status === 'completed'
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Sedang Diproses</p>
                    <p className="text-sm text-gray-600">Pengaduan sedang ditangani oleh admin</p>
                  </div>
                </div>
              )}

              {complaint.status === 'completed' && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full mt-1 bg-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Selesai</p>
                    <p className="text-sm text-gray-600">Pengaduan telah diselesaikan</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responses */}
        {complaint.responses && complaint.responses.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tanggapan Admin ({complaint.responses.length})
            </h2>
            <div className="space-y-4">
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
          </div>
        )}

        {complaint.responses?.length === 0 && complaint.status === 'pending' && (
          <div className="card bg-yellow-50 text-center py-8">
            <p className="text-yellow-800">
              Pengaduan Anda sedang menunggu untuk diproses oleh admin
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComplaintDetail;
