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
      toast.success('Permintaan reset password berhasil diproses');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses permintaan reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <FiKey className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan email terdaftar Anda untuk mendapatkan tautan pemulihan kata sandi
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <FiCheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-green-800 mb-1">
                Tautan Reset Password Dikirim
              </h3>
              <p className="text-sm text-green-700">
                Silakan periksa email Anda ({email}) untuk melanjutkan proses penggantian kata sandi.
              </p>
            </div>

            {resetToken && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <span className="font-semibold block mb-1">Mode Lokal / Development:</span>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="font-mono text-blue-600 hover:underline break-all"
                >
                  Klik di sini untuk langsung membuka form Reset Password
                </Link>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <FiArrowLeft className="w-4 h-4" />
                Kembali ke halaman Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Terdaftar
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center py-2.5 px-4"
              >
                {loading ? 'Memproses...' : 'Kirim Tautan Reset'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <FiArrowLeft className="w-4 h-4" />
                Kembali ke halaman Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
