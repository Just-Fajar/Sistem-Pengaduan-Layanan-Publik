import { useEffect, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

  // Cleanup object URL to prevent memory leaks
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
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Gagal memuat kategori');
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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
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

      toast.success('Pengaduan berhasil dibuat!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat pengaduan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Buat Pengaduan Baru</h1>
          <p className="text-gray-600 mt-1">Sampaikan keluhan atau aspirasi Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="input"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Pilih kategori yang sesuai dengan pengaduan Anda</p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Judul Pengaduan <span className="text-red-500">*</span>
            </label>
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
              placeholder="Contoh: Jalan berlubang di Jl. Sudirman"
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 5 karakter, maksimal 200 karakter</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={10}
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Jelaskan detail pengaduan Anda..."
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter. Jelaskan lokasi, waktu, dan detail pengaduan</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Pendukung (Opsional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                {photoPreview ? (
                  <div className="mb-4">
                    <img src={photoPreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Hapus foto
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="photo"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-600"
                      >
                        <span>Upload foto</span>
                        <input
                          id="photo"
                          name="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF maksimal 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Mengirim...' : 'Kirim Pengaduan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn btn-outline"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateComplaint;
