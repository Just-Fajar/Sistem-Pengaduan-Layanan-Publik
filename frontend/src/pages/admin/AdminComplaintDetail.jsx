import { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHash,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiTag,
  FiUser
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
      toast.info('Status tidak mengalami perubahan');
      return;
    }

    setUpdatingStatus(true);
    try {
      await api.put(`/admin/complaints/${id}/status`, { status: newStatus });
      toast.success('Status penanganan pengaduan berhasil diperbarui');
      fetchComplaintDetail();
    } catch (error) {
      toast.error('Gagal memperbarui status');
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
      toast.success('Tanggapan resmi berhasil dikirimkan');
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Memuat rincian laporan pengaduan...</p>
        </div>
      </Layout>
    );
  }

  if (!complaint) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pengaduan
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card p-6 sm:p-8 bg-white shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <FiTag className="w-3.5 h-3.5" />
                      {complaint.category?.name || 'Umum'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <FiHash className="w-3 h-3" />
                      ID: #{complaint.id}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {complaint.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FiClock className="w-3.5 h-3.5" />
                    <span>Diterima pada {formatDate(complaint.created_at)}</span>
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
                    alt="Foto pengaduan"
                    className="w-full max-h-[420px] object-cover rounded-xl mx-auto"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Isi Pengaduan Warga
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </div>
              </div>

              {/* Pelapor Profile */}
              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Informasi Identitas Pelapor
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FiUser className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Nama Pelapor</p>
                      <p className="font-semibold text-slate-800">{complaint.user?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiMail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Alamat Email</p>
                      <p className="font-semibold text-slate-800">{complaint.user?.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiPhone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Nomor Telepon</p>
                      <p className="font-semibold text-slate-800">{complaint.user?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiCalendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Waktu Masuk</p>
                      <p className="font-semibold text-slate-800">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>
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
                    Riwayat Tanggapan Resmi ({complaint.responses?.length || 0})
                  </h2>
                </div>
              </div>

              {!complaint.responses || complaint.responses.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Belum ada tanggapan yang dikirimkan untuk laporan ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {complaint.responses.map((resp) => (
                    <div
                      key={resp.id}
                      className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {resp.admin?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              {resp.admin?.name || 'Administrator'}
                              <FiCheckCircle className="w-3 h-3 text-indigo-600" />
                            </p>
                            <p className="text-[10px] text-slate-500">Petugas Terverifikasi</p>
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

              {/* Add Response Form */}
              <form onSubmit={handleSendResponse} className="pt-4 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Beri Tanggapan Resmi Petugas
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="input text-xs"
                  placeholder="Tuliskan tindakan penanganan, estimasi waktu pengerjaan dinas, atau penjelasan resmi..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingResponse}
                    className="btn btn-primary text-xs px-5 py-2.5"
                  >
                    {sendingResponse ? (
                      'Mengirim Tanggapan...'
                    ) : (
                      <>
                        <FiSend className="w-3.5 h-3.5" />
                        Kirim Tanggapan ke Pelapor
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Action Sidebar (1 Column) */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card p-6 bg-white shadow-soft space-y-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                Tindakan Status Aduan
              </h2>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Status Saat Ini
                </label>
                <div>
                  <StatusBadge status={complaint.status} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ubah Status Penanganan
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input text-xs cursor-pointer"
                >
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="processing">Sedang Diproses (Tim Berangkat)</option>
                  <option value="completed">Selesai Ditangani</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || newStatus === complaint.status}
                className="btn btn-primary w-full text-xs py-2.5"
              >
                {updatingStatus ? 'Memperbarui...' : 'Simpan Perubahan Status'}
              </button>
            </div>

            {/* Panduan Layanan */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border-indigo-100 space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Standar Operasional (SOP)
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span><strong>Menunggu:</strong> Aduan baru masuk, cek kelengkapan data & foto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Diproses:</strong> Surat penugasan diterbitkan ke dinas teknis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Selesai:</strong> Perbaikan fisik tuntas dan dikonfirmasi dinas.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminComplaintDetail;
