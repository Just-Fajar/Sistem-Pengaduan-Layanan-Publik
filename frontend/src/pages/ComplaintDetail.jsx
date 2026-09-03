import { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCornerDownRight,
  FiFileText,
  FiHash,
  FiImage,
  FiMessageSquare,
  FiShield,
  FiTag
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat rincian laporan...</p>
        </div>
      </Layout>
    );
  }

  if (!complaint) return null;

  const isPending = complaint.status === 'pending';
  const isProcessing = complaint.status === 'processing';
  const isCompleted = complaint.status === 'completed';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pengaduan
          </Link>
        </div>

        {/* Status Stepper Card */}
        <div className="card p-6 bg-white shadow-soft">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            Progres Penanganan Laporan
          </h2>
          <div className="grid grid-cols-3 gap-2 relative">
            {/* Connecting Line */}
            <div className="absolute top-4 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-0" />
            <div
              className={`absolute top-4 left-[16%] h-0.5 bg-indigo-600 transition-all duration-500 -z-0 ${
                isCompleted ? 'w-[68%]' : isProcessing ? 'w-[34%]' : 'w-0'
              }`}
            />

            {/* Step 1: Laporan Diterima */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <span className="text-xs font-bold text-slate-900 mt-2">Diterima</span>
              <span className="text-[10px] text-slate-400">Laporan terkirim</span>
            </div>

            {/* Step 2: Diproses */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isProcessing || isCompleted
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isProcessing || isCompleted ? '✓' : '2'}
              </div>
              <span
                className={`text-xs font-bold mt-2 ${
                  isProcessing || isCompleted ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Diproses
              </span>
              <span className="text-[10px] text-slate-400">Verifikasi & tim jalan</span>
            </div>

            {/* Step 3: Selesai */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : '3'}
              </div>
              <span
                className={`text-xs font-bold mt-2 ${
                  isCompleted ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                Selesai
              </span>
              <span className="text-[10px] text-slate-400">Tuntas ditangani</span>
            </div>
          </div>
        </div>

        {/* Main Complaint Detail Card */}
        <div className="card p-6 sm:p-8 bg-white shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  <FiTag className="w-3.5 h-3.5" />
                  {complaint.category?.name || 'Umum'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <FiHash className="w-3 h-3" />
                  #{complaint.id}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {complaint.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiClock className="w-3.5 h-3.5" />
                <span>Diajukan pada {formatDate(complaint.created_at)}</span>
              </div>
            </div>
            <div>
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Photo */}
          {complaint.photo_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
              <img
                src={complaint.photo_url}
                alt="Foto bukti pengaduan"
                className="w-full max-h-[420px] object-cover rounded-xl mx-auto"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Deskripsi & Rincian Pengaduan
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>
        </div>

        {/* Responses Card */}
        <div className="card p-6 sm:p-8 bg-white shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiMessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Tanggapan Resmi Petugas ({complaint.responses?.length || 0})
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <FiShield className="w-3 h-3" />
              Respon Terverifikasi
            </span>
          </div>

          {!complaint.responses || complaint.responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pengaduan Anda sedang ditinjau oleh dinas terkait. Tanggapan dan pembaruan akan langsung ditampilkan di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaint.responses.map((resp) => (
                <div
                  key={resp.id}
                  className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {resp.admin?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-none flex items-center gap-1">
                          {resp.admin?.name || 'Petugas Layanan'}
                          <FiCheckCircle className="w-3 h-3 text-indigo-600" />
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Petugas Verifikator</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(resp.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed pl-9">
                    {resp.response_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComplaintDetail;
