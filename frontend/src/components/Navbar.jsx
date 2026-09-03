import { useState } from 'react';
import { FiFileText, FiFolder, FiGrid, FiInbox, FiLogOut, FiMenu, FiPlusCircle, FiX } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const linkClasses = (path) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const mobileLinkClasses = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              to={isAdmin() ? '/admin/dashboard' : '/dashboard'}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Pengaduan<span className="text-indigo-600 font-extrabold">Publik</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Layanan Terpadu
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {isAdmin() ? (
                  <>
                    <Link to="/admin/dashboard" className={linkClasses('/admin/dashboard')}>
                      <FiGrid className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link to="/admin/complaints" className={linkClasses('/admin/complaints')}>
                      <FiInbox className="w-4 h-4 text-slate-400" />
                      Kelola Pengaduan
                    </Link>
                    <Link to="/admin/categories" className={linkClasses('/admin/categories')}>
                      <FiFolder className="w-4 h-4 text-slate-400" />
                      Kategori
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className={linkClasses('/dashboard')}>
                      <FiGrid className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link to="/complaints/create" className={linkClasses('/complaints/create')}>
                      <FiPlusCircle className="w-4 h-4 text-slate-400" />
                      Buat Pengaduan
                    </Link>
                    <Link to="/complaints" className={linkClasses('/complaints')}>
                      <FiInbox className="w-4 h-4 text-slate-400" />
                      Riwayat
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Desktop User Profile & Logout */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100/70 border border-transparent hover:border-slate-200/60 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 capitalize">
                    {user.role === 'admin' ? 'Administrator' : 'Masyarakat'}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
                title="Keluar"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Menu"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top duration-200">
          {user && (
            <>
              <div className="space-y-1">
                {isAdmin() ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/admin/dashboard')}
                    >
                      <FiGrid className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/complaints"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/admin/complaints')}
                    >
                      <FiInbox className="w-4 h-4" />
                      Kelola Pengaduan
                    </Link>
                    <Link
                      to="/admin/categories"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/admin/categories')}
                    >
                      <FiFolder className="w-4 h-4" />
                      Kategori
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/dashboard')}
                    >
                      <FiGrid className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/complaints/create"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/complaints/create')}
                    >
                      <FiPlusCircle className="w-4 h-4" />
                      Buat Pengaduan
                    </Link>
                    <Link
                      to="/complaints"
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClasses('/complaints')}
                    >
                      <FiInbox className="w-4 h-4" />
                      Riwayat
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
