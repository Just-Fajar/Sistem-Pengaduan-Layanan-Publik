import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiKey, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (response.data.data?.token) {
        setResetToken(response.data.data.token);
      }
      toast.success('Permintaan pemulihan berhasil diproses');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses permintaan reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <FiKey className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lupa Kata Sandi
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Masukkan alamat email Anda untuk menerima instruksi pemulihan
          </p>
        </div>

        <div className="card shadow-soft p-8 bg-white/95 backdrop-blur-xs">
          {submitted ? (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Tautan Pemulihan Dikirim
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instruksi pemulihan telah dikirim ke <span className="font-semibold text-slate-700">{email}</span>.
                </p>
              </div>

              {resetToken && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-left">
                  <span className="text-[11px] font-bold text-indigo-900 block mb-1 uppercase tracking-wider">
                    Simulasi Mode Pengembang:
                  </span>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline break-all"
                  >
                    Buka Formulir Atur Ulang Kata Sandi →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="btn btn-outline w-full justify-center text-xs"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-sm font-semibold"
              >
                {loading ? 'Memproses...' : 'Kirim Instruksi Pemulihan'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <FiArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
