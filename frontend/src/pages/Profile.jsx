import { useEffect, useState } from 'react';
import { FiCheck, FiLock, FiMail, FiPhone, FiSave, FiShield, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/profile', {
        name: profileData.name,
        phone: profileData.phone,
      });

      updateUser(response.data.data);
      toast.success('Profil akun Anda berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await api.put('/profile/password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });

      toast.success('Kata sandi Anda berhasil diubah');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah kata sandi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pengaturan Akun & Keamanan
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
              {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data diri, nomor kontak pelaporan, dan kata sandi akses akun Anda.
          </p>
        </div>

        {/* User Card Snapshot */}
        <div className="card p-5 bg-white shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
            <FiShield className="w-3 h-3" />
            Akun Terverifikasi
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="card p-6 bg-white shadow-soft space-y-6">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-sm">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiUser className="w-3.5 h-3.5" />
              Informasi Profil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiLock className="w-3.5 h-3.5" />
              Ubah Kata Sandi
            </button>
          </div>

          {/* Tab 1: Profile Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="input pl-10 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Alamat Email
                  </label>
                  <span className="text-[11px] text-slate-400">Email identitas utama tidak dapat diubah</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={profileData.email}
                    className="input pl-10 text-xs bg-slate-100/70 text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="input pl-10 text-xs"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs px-5 py-2.5"
                >
                  {loading ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <FiSave className="w-3.5 h-3.5" />
                      Simpan Perubahan Profil
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="input text-xs"
                  required
                  placeholder="Masukkan kata sandi saat ini"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kata Sandi Baru
                  </label>
                  <span className="text-[11px] text-slate-400">Minimal 6 karakter</span>
                </div>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="input text-xs"
                  required
                  minLength={6}
                  placeholder="Masukkan kata sandi baru"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="input text-xs"
                  required
                  placeholder="Ulangi kata sandi baru"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs px-5 py-2.5"
                >
                  {loading ? (
                    'Mengubah...'
                  ) : (
                    <>
                      <FiLock className="w-3.5 h-3.5" />
                      Perbarui Kata Sandi
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
