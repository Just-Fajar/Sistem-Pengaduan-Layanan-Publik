import { FiAlertCircle, FiArrowLeft, FiHome } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const homePath = user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center py-12 px-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
          <FiAlertCircle className="w-10 h-10" />
        </div>

        <h1 className="text-6xl font-extrabold text-blue-600 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline flex items-center justify-center gap-2 py-2.5 px-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <Link
            to={homePath}
            className="btn btn-primary flex items-center justify-center gap-2 py-2.5 px-4"
          >
            <FiHome className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
