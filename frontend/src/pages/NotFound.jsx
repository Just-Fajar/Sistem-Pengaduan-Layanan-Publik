import { FiAlertCircle, FiArrowLeft, FiHome } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const homePath = user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70 pointer-events-none" />

      <div className="max-w-md w-full text-center py-12 px-8 bg-white/95 backdrop-blur-xs rounded-2xl shadow-soft border border-slate-200/80 relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
          <FiAlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          Galat 404
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-2 tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-slate-500 mb-8 leading-relaxed max-w-xs mx-auto">
          Tautan yang Anda tuju tidak tersedia atau telah dipindahkan ke alamat lain.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline text-xs py-2.5 px-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <Link
            to={homePath}
            className="btn btn-primary text-xs py-2.5 px-4"
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
