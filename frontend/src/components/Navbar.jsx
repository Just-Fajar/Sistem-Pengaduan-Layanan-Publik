import { useState } from 'react';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAdmin() ? '/admin/dashboard' : '/dashboard'} className="flex items-center">
              <span className="text-xl font-bold text-primary">Pengaduan Publik</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                {isAdmin() ? (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Dashboard
                    </Link>
                    <Link to="/admin/complaints" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Kelola Pengaduan
                    </Link>
                    <Link to="/admin/categories" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Kategori
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Dashboard
                    </Link>
                    <Link to="/complaints/create" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Buat Pengaduan
                    </Link>
                    <Link to="/complaints" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
                      Riwayat
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-3 border-l pl-4">
                  <Link to="/profile" className="text-right hover:text-primary">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'User'}</p>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700"
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <>
                {isAdmin() ? (
                  <>
                    <Link to="/admin/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Dashboard
                    </Link>
                    <Link to="/admin/complaints" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Kelola Pengaduan
                    </Link>
                    <Link to="/admin/categories" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Kategori
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Dashboard
                    </Link>
                    <Link to="/complaints/create" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Buat Pengaduan
                    </Link>
                    <Link to="/complaints" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      Riwayat
                    </Link>
                  </>
                )}
                <div className="border-t pt-2 mt-2">
                  <Link to="/profile" className="block px-3 py-2">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
