'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

function isInstagramUrl(value = '') {
  try {
    return new URL(value).hostname.replace('www.', '') === 'instagram.com';
  } catch {
    return false;
  }
}

function isLikelyImageSource(value = '') {
  if (value.startsWith('data:image/')) return true;
  try {
    const host = new URL(value).hostname.replace('www.', '');
    return !['instagram.com', 'facebook.com', 'youtube.com'].includes(host);
  } catch {
    return false;
  }
}

const donationIconOptions = [
  { value: 'Heart', label: 'Heart' },
  { value: 'Utensils', label: 'Meals' },
  { value: 'Syringe', label: 'Vaccination' },
  { value: 'HeartPulse', label: 'Medical care' },
  { value: 'Ambulance', label: 'Rescue' },
  { value: 'PawPrint', label: 'Animal care' },
  { value: 'HeartHandshake', label: 'Support' },
];

function normalizeSettings(data) {
  return {
    ...data,
    donationTiers: data.donationTiers || [],
    instagramPosts: (data.instagramPosts || []).map((post) => isInstagramUrl(post.image)
      ? { ...post, postUrl: post.postUrl || post.image, image: '' }
      : post),
    rescueLocations: data.rescueLocations || [],
    volunteerActivities: data.volunteerActivities || [],
  };
}

function settingsSnapshot(value) {
  return JSON.stringify(value);
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    facebook: '',
    instagram: '',
    youtube: '',
    maintenanceMode: false,
    upiId: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    bankBranch: '',
    donationTiers: [],
    instagramPosts: [],
    rescueLocations: [],
    volunteerActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('site');
  const [savedSnapshot, setSavedSnapshot] = useState('');

  const isDirty = savedSnapshot !== '' && settingsSnapshot(settings) !== savedSnapshot;

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        const normalizedSettings = normalizeSettings(data.data);
        setSettings(normalizedSettings);
        setSavedSnapshot(settingsSnapshot(normalizedSettings));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleInternalNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      if (saving) {
        event.preventDefault();
        return;
      }

      const leave = window.confirm('You have unsaved settings. Leave without saving?');
      if (!leave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [isDirty, saving]);

  async function handleSubmit(e) {
    e.preventDefault();
    const incompleteTier = (settings.donationTiers || []).find((tier) => (
      !Number.isFinite(Number(tier.amount))
      || Number(tier.amount) <= 0
      || !tier.title?.trim()
      || !tier.description?.trim()
      || !tier.impact?.trim()
    ));
    if (incompleteTier) {
      setActiveTab('donation');
      setMessage({ type: 'error', text: 'Complete each donation tier’s amount, title, description, and impact before saving.' });
      return;
    }
    const incompletePost = (settings.instagramPosts || []).find((post) => !isLikelyImageSource(post.image));
    if (incompletePost) {
      setActiveTab('social');
      setMessage({ type: 'error', text: 'Each homepage Instagram card needs a display image. Upload one to continue.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          instagramPosts: (settings.instagramPosts || []).map(({ id, image, caption, postUrl }) => ({ id, image, caption, postUrl })),
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const normalizedSettings = normalizeSettings(data.data || settings);
        setSettings(normalizedSettings);
        setSavedSnapshot(settingsSnapshot(normalizedSettings));
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleDonationTierChange(index, field, value) {
    const newTiers = [...settings.donationTiers];
    newTiers[index] = { ...newTiers[index], [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value };
    setSettings(prev => ({ ...prev, donationTiers: newTiers }));
  }

  function handleInstagramPostChange(index, field, value) {
    const newPosts = [...settings.instagramPosts];
    newPosts[index] = { ...newPosts[index], [field]: value };
    setSettings(prev => ({ ...prev, instagramPosts: newPosts }));
  }

  function addDonationTier() {
    const newTier = {
      id: Date.now(),
      amount: '',
      title: '',
      description: '',
      icon: 'Heart',
      impact: ''
    };
    setSettings(prev => ({ ...prev, donationTiers: [...prev.donationTiers, newTier] }));
  }

  function removeDonationTier(index) {
    const newTiers = settings.donationTiers.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, donationTiers: newTiers }));
  }

  function discardChanges() {
    if (!savedSnapshot) return;
    setSettings(JSON.parse(savedSnapshot));
    setMessage({ type: 'success', text: 'Unsaved changes were discarded.' });
  }

  function addInstagramPost() {
    if ((settings.instagramPosts || []).length >= 9) {
      setMessage({ type: 'error', text: 'The homepage supports up to 9 Instagram cards.' });
      return;
    }
    const newPost = {
      id: Date.now(),
      image: '',
      caption: '',
      postUrl: '',
    };
    setSettings(prev => ({ ...prev, instagramPosts: [...prev.instagramPosts, newPost] }));
  }

  function removeInstagramPost(index) {
    const newPosts = settings.instagramPosts.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, instagramPosts: newPosts }));
  }

  function handleInstagramImageUpload(index, file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Display images must be smaller than 8 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sourceImage = new window.Image();
      sourceImage.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 900;
        const cropSize = Math.min(sourceImage.width, sourceImage.height);
        const sourceX = (sourceImage.width - cropSize) / 2;
        const sourceY = (sourceImage.height - cropSize) / 2;
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(sourceImage, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
        handleInstagramPostChange(index, 'image', canvas.toDataURL('image/webp', 0.82));
      };
      sourceImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function handleLocationChange(index, field, value) {
    const locations = [...(settings.rescueLocations || [])];
    const parsedValue = field === 'animalsHelped'
      ? Number(value)
      : field === 'latitude' || field === 'longitude'
        ? Number(value)
        : value;
    const location = { ...locations[index] };
    if (field === 'latitude') location.coordinates = [parsedValue, location.coordinates?.[1] || 0];
    else if (field === 'longitude') location.coordinates = [location.coordinates?.[0] || 0, parsedValue];
    else location[field] = parsedValue;
    locations[index] = location;
    setSettings((current) => ({ ...current, rescueLocations: locations }));
  }

  function addLocation() {
    const location = { id: Date.now(), name: 'New rescue point', coordinates: [30.3165, 78.0322], address: '', animalsHelped: 0 };
    setSettings((current) => ({ ...current, rescueLocations: [...(current.rescueLocations || []), location] }));
  }

  function removeLocation(index) {
    setSettings((current) => ({ ...current, rescueLocations: current.rescueLocations.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateActivity(index, value) {
    const activities = [...(settings.volunteerActivities || [])];
    activities[index] = value;
    setSettings((current) => ({ ...current, volunteerActivities: activities }));
  }

  function addActivity() {
    setSettings((current) => ({ ...current, volunteerActivities: [...(current.volunteerActivities || []), 'New volunteer activity'] }));
  }

  function removeActivity(index) {
    setSettings((current) => ({ ...current, volunteerActivities: current.volunteerActivities.filter((_, itemIndex) => itemIndex !== index) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'site', label: 'Site Info' },
    { id: 'donation', label: 'Bank & Payments' },
    { id: 'social', label: 'Social Media' },
    { id: 'programs', label: 'Programs & Locations' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/10 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">Site settings</p>
          <p className="mt-1 text-xs text-primary/55">Changes stay local until you save. Leaving this page will ask before discarding them.</p>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${isDirty ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
      </div>
      
      {message.text && (
        <div className={`alert mb-6 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="tabs tabs-boxed mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {activeTab === 'site' && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">Site Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary mb-2">Site Description</label>
                  <textarea
                    name="siteDescription"
                    value={settings.siteDescription || ''}
                    onChange={handleChange}
                    rows={3}
                    className="textarea textarea-bordered w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode || false}
                      onChange={handleChange}
                      className="checkbox checkbox-primary"
                    />
                    <span className="text-primary"><strong className="block">Enable maintenance mode</strong><small className="mt-1 block font-normal text-primary/50">Replaces all public pages with a temporary notice. The admin panel remains available.</small></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donation' && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">Payment Details</h2>
              {settings.upiId === 'lahit@upi' && <div className="alert alert-warning mb-5"><span>The UPI ID is still a placeholder and is hidden on the public website. Replace it before accepting UPI donations.</span></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={settings.upiId || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Bank Account Name</label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={settings.bankAccountName || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={settings.bankAccountNumber || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">IFSC Code</label>
                  <input
                    type="text"
                    name="bankIfscCode"
                    value={settings.bankIfscCode || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={settings.bankName || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Branch</label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={settings.bankBranch || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                <h2 className="text-xl font-bold text-primary">Donation tiers</h2>
                <p className="mt-1 text-sm leading-relaxed text-primary/60">These cards appear on the public donation section. Add a clear amount and message donors can understand at a glance.</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary/60">
                  <span><strong className="text-primary">Required:</strong> amount, title, description, impact</span>
                  <span><strong className="text-primary">Optional:</strong> icon (Heart is used if unchanged)</span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                {(settings.donationTiers || []).map((tier, index) => (
                  <div key={tier.id || index} className="rounded-2xl border border-primary/10 bg-base-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-secondary">Tier {index + 1}</p>
                        <h3 className="mt-1 text-lg font-bold text-primary">{tier.title || 'Untitled donation tier'}</h3>
                      </div>
                      <button type="button" onClick={() => removeDonationTier(index)} className="btn btn-sm btn-error">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="form-control">
                        <span className="mb-1.5 text-sm font-bold text-primary">Amount <span className="text-error">*</span></span>
                        <input type="number" min="1" value={tier.amount} onChange={(e) => handleDonationTierChange(index, 'amount', e.target.value)} placeholder="Example: 500" className="input input-bordered w-full" required />
                        <span className="mt-1 text-xs text-primary/45">Use whole Indian rupees.</span>
                      </label>
                      <label className="form-control">
                        <span className="mb-1.5 text-sm font-bold text-primary">Tier title <span className="text-error">*</span></span>
                        <input type="text" value={tier.title || ''} onChange={(e) => handleDonationTierChange(index, 'title', e.target.value)} placeholder="Example: Food & Care" className="input input-bordered w-full" required />
                        <span className="mt-1 text-xs text-primary/45">Short name shown above the description.</span>
                      </label>
                      <label className="form-control">
                        <span className="mb-1.5 text-sm font-bold text-primary">Icon <span className="font-normal text-primary/45">(optional)</span></span>
                        <select value={tier.icon || 'Heart'} onChange={(e) => handleDonationTierChange(index, 'icon', e.target.value)} className="select select-bordered w-full">
                          {donationIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <span className="mt-1 text-xs text-primary/45">Visual cue for the public card.</span>
                      </label>
                      <label className="form-control">
                        <span className="mb-1.5 text-sm font-bold text-primary">Short description <span className="text-error">*</span></span>
                        <input type="text" value={tier.description || ''} onChange={(e) => handleDonationTierChange(index, 'description', e.target.value)} placeholder="Example: Provides food and clean water" className="input input-bordered w-full" required />
                        <span className="mt-1 text-xs text-primary/45">Explain what this donation supports.</span>
                      </label>
                      <label className="form-control md:col-span-2">
                        <span className="mb-1.5 text-sm font-bold text-primary">Impact statement <span className="text-error">*</span></span>
                        <input type="text" value={tier.impact || ''} onChange={(e) => handleDonationTierChange(index, 'impact', e.target.value)} placeholder="Example: Supports daily care for rescued animals" className="input input-bordered w-full" required />
                        <span className="mt-1 text-xs text-primary/45">The result donors should associate with this amount.</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addDonationTier}
                className="btn btn-primary"
              >
                + Add Tier
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">Social Media Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Facebook</label>
                  <input
                    type="text"
                    name="facebook"
                    value={settings.facebook || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={settings.instagram || ''}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">YouTube</label>
                  <input
                    type="text"
                    name="youtube"
                    value={settings.youtube || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="mb-6 border-t border-primary/10 pt-8">
                <h2 className="text-xl font-bold text-primary">Homepage Instagram Cards</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-primary/55">
                  Your Instagram profile link above only controls the “Follow us” button. Each homepage card also needs its own display image. Upload an image from your computer, then optionally add the exact Instagram post link.
                </p>
              </div>
              <div className="space-y-5 mb-5">
                {(settings.instagramPosts || []).map((post, index) => (
                  <div key={post.id || index} className="rounded-3xl border border-primary/10 bg-base-200 p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-secondary">Homepage card {index + 1}</p>
                        <p className="mt-1 text-xs text-primary/45">Likes and comment counters are not entered manually.</p>
                      </div>
                      <button type="button" onClick={() => removeInstagramPost(index)} className="btn btn-sm btn-error">Remove</button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
                      <div>
                        <p className="mb-2 text-sm font-bold text-primary">Display image <span className="text-error">*</span></p>
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-primary/10 bg-white">
                          {isLikelyImageSource(post.image) ? (
                            <Image src={post.image} alt={post.caption || `Instagram card ${index + 1}`} fill unoptimized className="object-cover" />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-xs font-semibold text-primary/38">
                              No display image selected
                            </div>
                          )}
                        </div>
                        <label className="mt-3 flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-white hover:bg-[#164a36]">
                          Upload image
                          <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleInstagramImageUpload(index, event.target.files?.[0])} />
                        </label>
                        <p className="mt-2 text-[0.68rem] leading-relaxed text-primary/45">Automatically cropped square and stored with the site data.</p>
                      </div>

                      <div className="grid content-start gap-4">
                        <label>
                          <span className="mb-2 block text-sm font-bold text-primary">Caption</span>
                          <textarea value={post.caption || ''} onChange={(event) => handleInstagramPostChange(index, 'caption', event.target.value)} rows={3} placeholder="Example: Bruno is ready for adoption 🐾" className="textarea textarea-bordered w-full" />
                          <span className="mt-1.5 block text-xs text-primary/45">Shown over the image on the homepage.</span>
                        </label>
                        <label>
                          <span className="mb-2 block text-sm font-bold text-primary">Instagram post link <span className="font-normal text-primary/45">(optional)</span></span>
                          <input type="url" value={post.postUrl || ''} onChange={(event) => handleInstagramPostChange(index, 'postUrl', event.target.value)} placeholder="https://www.instagram.com/p/POST_ID/" className="input input-bordered w-full" />
                          <span className="mt-1.5 block text-xs text-primary/45">Used when someone clicks this card. This is not the display image.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addInstagramPost}
                className="btn btn-primary"
              >
                + Add homepage card
              </button>
            </div>
          )}

          {activeTab === 'programs' && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-2">Volunteer Activities</h2>
              <p className="text-sm text-primary/55 mb-5">These options appear in the public volunteer section.</p>
              <div className="space-y-3 mb-4">
                {(settings.volunteerActivities || []).map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <input value={activity} onChange={(event) => updateActivity(index, event.target.value)} className="input input-bordered flex-1" />
                    <button type="button" onClick={() => removeActivity(index)} className="btn btn-error btn-sm self-center">Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addActivity} className="btn btn-primary btn-sm">+ Add activity</button>

              <h2 className="text-xl font-bold text-primary mt-10 mb-2">Rescue Locations</h2>
              <p className="text-sm text-primary/55 mb-5">Saved locations power the public rescue map.</p>
              <div className="space-y-4 mb-4">
                {(settings.rescueLocations || []).map((location, index) => (
                  <div key={location.id || index} className="rounded-2xl border border-primary/10 bg-base-200 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input value={location.name || ''} onChange={(event) => handleLocationChange(index, 'name', event.target.value)} placeholder="Location name" className="input input-bordered" />
                      <input value={location.address || ''} onChange={(event) => handleLocationChange(index, 'address', event.target.value)} placeholder="Address" className="input input-bordered" />
                      <input type="number" step="any" value={location.coordinates?.[0] || 0} onChange={(event) => handleLocationChange(index, 'latitude', event.target.value)} placeholder="Latitude" className="input input-bordered" />
                      <input type="number" step="any" value={location.coordinates?.[1] || 0} onChange={(event) => handleLocationChange(index, 'longitude', event.target.value)} placeholder="Longitude" className="input input-bordered" />
                      <input type="number" value={location.animalsHelped || 0} onChange={(event) => handleLocationChange(index, 'animalsHelped', event.target.value)} placeholder="Animals helped" className="input input-bordered" />
                    </div>
                    <button type="button" onClick={() => removeLocation(index)} className="btn btn-error btn-sm mt-4">Remove location</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLocation} className="btn btn-primary btn-sm">+ Add location</button>
            </div>
          )}
          
          <div className="mt-8">
            {isDirty && (
              <button type="button" onClick={discardChanges} className="mr-3 rounded-full px-5 py-3 text-sm font-bold text-primary/65 hover:bg-primary/5">
                Discard changes
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!isDirty}
            >
              {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'All Changes Saved'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
