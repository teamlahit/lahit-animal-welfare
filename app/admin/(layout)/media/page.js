'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, Image as ImageIcon, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { uploadImage } from '@/lib/upload-image';

const builtInMedia = [
  { filename: 'rescue-hero-v2.webp', url: '/images/rescue-hero-v2.webp', category: 'hero', alt: 'A LAHIT volunteer caring for a rescued dog in Uttarakhand' },
  { filename: 'rescue-hero-v3.webp', url: '/images/rescue-hero-v3.webp', category: 'hero', alt: 'Volunteers caring for rescued dogs in Uttarakhand' },
  { filename: 'rescue-hero-v5.webp', url: '/images/rescue-hero-v5.webp', category: 'hero', alt: 'A veterinarian examining a rescued dog during a clinic check-up' },
  { filename: 'rescue-hero-v6.webp', url: '/images/rescue-hero-v6.webp', category: 'hero', alt: 'Veterinary staff providing medical treatment to a rescued animal' },
  { filename: 'hero-dog.jpg', url: '/images/hero-dog.jpg', category: 'general', alt: 'LAHIT rescue dog' },
  { filename: 'lahit.png', url: '/lahit.png', category: 'general', alt: 'LAHIT logo' },
].map((item) => ({ ...item, _id: `built-in:${item.url}`, type: 'image', isBuiltIn: true }));

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    filename: '',
    url: '',
    type: 'image',
    category: 'hero',
    alt: '',
    caption: '',
    uploadedBy: 'Admin'
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.url) {
      setMessage({ type: 'error', text: 'Please upload an image.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const url = editingMedia ? `/api/media/${editingMedia._id}` : '/api/media';
      const method = editingMedia ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingMedia ? 'Media updated successfully!' : 'Media added successfully!' });
        fetchMedia();
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save media.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving media.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image files must be smaller than 8 MB.' });
      return;
    }

    setUploadingImage(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({ ...prev, url: result.url, filename: file.name }));
      setMessage({ type: 'success', text: 'Image uploaded successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Image upload failed.' });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this media?')) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Media deleted successfully!' });
        fetchMedia();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete media.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting media.' });
    } finally {
      setDeletingId(null);
    }
  }

  function editMedia(item) {
    setEditingMedia(item);
    setFormData({
      filename: item.filename,
      url: item.url,
      type: 'image',
      category: item.category,
      alt: item.alt || '',
      caption: item.caption || '',
      uploadedBy: item.uploadedBy || 'Admin'
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingMedia(null);
    setFormData({
      filename: '',
      url: '',
      type: 'image',
      category: 'hero',
      alt: '',
      caption: '',
      uploadedBy: 'Admin'
    });
  }

  const allMedia = [...media, ...builtInMedia];
  const filteredMedia = allMedia.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.alt || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Media Library</h1>
          <p className="mt-1 text-sm text-primary/60">Browse images used across the site. Manage homepage carousel slides in Settings → Homepage Hero.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowForm(true); }}
          variant="primary"
          icon={ImageIcon}
        >
          + Add Media
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/10 bg-base-100 px-5 py-4 text-sm text-primary/65">
        <strong className="text-primary">Two image types appear here.</strong> “Site file” images are built into the website and can’t be edited here. “Uploaded image” files can be edited or deleted. Removing an image from the homepage carousel does not delete the file.
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-success/10 text-success-content' 
            : 'bg-error/10 text-error-content'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card bg-base-100 shadow-sm mb-8">
          <div className="card-body">
            <h2 className="card-title text-primary">
              {editingMedia ? 'Edit Media' : 'Add New Media'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Filename</label>
                  <input
                    type="text"
                    name="filename"
                    value={formData.filename}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full"
                    placeholder="hero-dog.jpg"
                  />
                </div>
                
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Homepage placement</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="hero">Homepage hero carousel</option>
                  <option value="volunteer">Volunteer section</option>
                  <option value="rescue">Rescue stories</option>
                  <option value="animal">Animal profiles</option>
                  <option value="event">Events</option>
                  <option value="general">General site image</option>
                  <option value="blog">Blog</option>
                </select>
              </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">Image</label>
                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-3">
                    {formData.url ? (
                      <div className="relative mb-3 h-48 w-full overflow-hidden rounded-lg">
                        <Image src={formData.url} alt={formData.alt || formData.filename || 'Media preview'} fill unoptimized className="object-cover" />
                      </div>
                    ) : (
                      <div className="mb-3 flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-base-300 text-sm text-primary/60">
                        No image selected
                      </div>
                    )}
                    <label className="btn btn-sm btn-primary cursor-pointer">
                      {uploadingImage ? 'Uploading...' : formData.url ? 'Replace image' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(event) => handleImageUpload(event.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
                
              <div>
                  <label className="block text-sm font-medium text-primary mb-2">Alt Text</label>
                  <input
                    type="text"
                    name="alt"
                    value={formData.alt}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Image description"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">Caption</label>
                  <input
                    type="text"
                    name="caption"
                    value={formData.caption}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Optional caption"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  {editingMedia ? 'Update Media' : 'Add Media'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="form-control flex-1">
              <div className="input input-bordered flex items-center gap-2">
                <Search className="w-4 h-4 text-primary/60" />
                <input
                  type="text"
                  placeholder="Search filename, description, or alt text…"
                  className="grow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="select select-bordered"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
                  <option value="">All Categories</option>
                  <option value="hero">Homepage hero</option>
                  <option value="volunteer">Volunteer section</option>
                  <option value="rescue">Rescue stories</option>
                  <option value="animal">Animal profiles</option>
                  <option value="event">Events</option>
                  <option value="general">General site images</option>
                  <option value="blog">Blog</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.length === 0 ? (
              <div className="col-span-full text-center text-primary/60 py-12">
                No media found in this category.
              </div>
            ) : (
              filteredMedia.map((item) => (
                <div key={item._id} className="card bg-base-200 shadow-sm">
                  <div className="aspect-square bg-base-300 relative">
                    {item.type === 'image' ? (
                      <Image src={item.url} alt={item.alt || item.filename} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 badge badge-sm ${item.isBuiltIn ? 'badge-neutral' : 'badge-primary'}`}>
                      {item.isBuiltIn ? 'Site file' : 'Uploaded image'}
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-sm font-medium text-primary truncate">{item.filename}</p>
                    <p className="text-xs text-primary/60">{({ hero: 'Homepage hero', volunteer: 'Volunteer section', rescue: 'Rescue stories', animal: 'Animal profiles', event: 'Events', general: 'General site image', blog: 'Blog' })[item.category] || 'General site image'}</p>
                    {item.isBuiltIn ? (
                      <p className="mt-3 text-xs font-semibold text-primary/45">Built into the website</p>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => editMedia(item)}
                          className="btn btn-xs btn-ghost flex-1 text-primary"
                          aria-label={`Edit ${item.filename}`}
                          title="Edit image details"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="btn btn-xs btn-ghost text-error"
                          aria-label={`Delete ${item.filename}`}
                          title="Delete uploaded image"
                        >
                          {deletingId === item._id ? '...' : <><Trash2 className="w-3 h-3" /><span>Delete</span></>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
