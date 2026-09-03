import { useEffect, useState } from 'react';
import { FiArrowLeft, FiImage, FiSend, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import api from '../utils/axios';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat daftar kategori');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran berkas foto maksimal 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Format berkas harus berupa gambar (JPG, PNG, WebP)');
        return;
      }

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('category_id', formData.category_id);
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (photo) {
        data.append('photo', photo);
      }

      await api.post('/complaints', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Pengaduan Anda berhasil dikirim!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pengaduan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Buat Pengaduan Baru
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sampaikan aspirasi atau kendala fasilitas umum dengan jelas agar petugas dapat segera menindaklanjuti.
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8 bg-white shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategori */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="category_id" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kategori Layanan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Pilih bidang terkait</span>
              </div>
              <select
                id="category_id"
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="input cursor-pointer"
              >
                <option value="">Pilih kategori yang sesuai...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Judul */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Judul Pengaduan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.title.length}/200
                </span>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                required
                minLength={5}
                maxLength={200}
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Misal: Lampu jalan mati di pertigaan Jl. Merdeka"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Minimal 10 karakter
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="input leading-relaxed resize-y"
                placeholder="Jelaskan kronologi, titik lokasi spesifik, dampak yang ditimbulkan, atau waktu kejadian secara jelas..."
              />
            </div>

            {/* Upload Foto Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Foto Bukti Pendukung (Opsional)
              </label>

              {photoPreview ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 p-2">
                  <img
                    src={photoPreview}
                    alt="Preview Unggahan"
                    className="max-h-72 w-full object-cover rounded-xl mx-auto"
                  />
                  <div className="flex items-center justify-between mt-2 px-2 pb-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <FiImage className="w-3.5 h-3.5" />
                      {photo?.name} ({(photo.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 group-hover:text-indigo-600 flex items-center justify-center shadow-xs border border-slate-200/60 mb-2 transition-colors">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                    Klik untuk memilih foto atau seret berkas ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format gambar PNG, JPG, JPEG, atau GIF (Maksimal 5MB)
                  </p>
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Submit & Cancel */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline w-full sm:w-auto py-2.5 px-6"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full sm:flex-1 py-2.5 px-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim Pengaduan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiSend className="w-4 h-4" />
                    Kirim Pengaduan Sekarang
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateComplaint;
