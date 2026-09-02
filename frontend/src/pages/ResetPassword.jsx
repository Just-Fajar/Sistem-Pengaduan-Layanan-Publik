import { useState } from 'react';
import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token reset password tidak ditemukan');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      setSuccess(true);
      toast.success('Password berhasil diubah!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mereset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <FiLock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Atur Ulang Kata Sandi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan masukkan kata sandi baru Anda
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-800 mb-1">
                Kata Sandi Berhasil Diperbarui!
              </h3>
              <p className="text-sm text-green-700">
                Anda akan dialihkan ke halaman login dalam beberapa detik...
              </p>
            </div>
            <Link to="/login" className="btn btn-primary w-full py-2.5 px-4 block">
              Login Sekarang
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!searchParams.get('token') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token Reset Password
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="input mt-1"
                  placeholder="Tempel token reset di sini"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kata Sandi Baru
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Ulangi kata sandi baru"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center py-2.5 px-4"
              >
                {loading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
