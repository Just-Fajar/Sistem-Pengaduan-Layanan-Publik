import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login berhasil!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Login</h2>
          <p className="mt-2 text-gray-600">Sistem Pengaduan Layanan Publik</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input mt-1"
              placeholder="nama@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Lupa password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input mt-1"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Daftar disini
            </Link>
          </p>
        </div>

        {/* Demo credentials (development only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Demo Login (Development Only):</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@example.com / password123</p>
              <p><strong>User:</strong> john@example.com / password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
