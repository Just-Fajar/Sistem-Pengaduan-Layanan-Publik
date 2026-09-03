import { useEffect, useState } from 'react';
import { FiEdit2, FiFolder, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../utils/axios';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await api.put(`/admin/categories/${currentCategory.id}`, formData);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await api.post('/admin/categories', formData);
        toast.success('Kategori baru berhasil ditambahkan');
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Kelola Kategori Layanan
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {categories.length} Kategori
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Atur klasifikasi layanan publik yang dapat dipilih masyarakat saat mengajukan pengaduan.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary text-xs"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Kategori Baru
          </button>
        </div>

        {/* Categories Table Card */}
        <div className="card p-0 bg-white shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner message="Memuat daftar kategori..." />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FiFolder className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-700">Belum ada kategori terdaftar</p>
              <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menambahkan kategori pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Nama Kategori
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Deskripsi & Ruang Lingkup
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Total Laporan
                    </th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-400">
                        #{category.id}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-900">{category.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-500 max-w-lg leading-relaxed">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {category.complaints_count || 0} aduan
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(category)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-md border border-slate-200/80">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  {editMode ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nama Kategori <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input text-xs"
                    placeholder="Contoh: Transportasi & Jalan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Deskripsi & Ruang Lingkup
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input text-xs resize-y"
                    placeholder="Jelaskan jenis-jenis aduan yang masuk ke kategori ini..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-outline text-xs px-4"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary text-xs px-5">
                    {editMode ? 'Simpan Perubahan' : 'Tambah Kategori'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminCategories;
