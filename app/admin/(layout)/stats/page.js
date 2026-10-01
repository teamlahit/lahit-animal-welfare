'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function AdminStats() {
  const [stats, setStats] = useState({
    animalsRescued: 0,
    mealsServed: 0,
    treatments: 0,
    adoptions: 0,
    volunteers: 0,
    citiesCovered: 0,
    partnerVets: 0,
    yearsActive: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(
          Object.entries(stats).map(([name, value]) => [name, value === '' ? 0 : Number(value)])
        ))
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Statistics updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update statistics.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating statistics.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setStats(prev => ({
      ...prev,
      [name]: value
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Statistics</h1>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-success/10 text-success-content' 
            : 'bg-error/10 text-error-content'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Animals Rescued
              </label>
              <input
                type="number"
                name="animalsRescued"
                value={stats.animalsRescued}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Meals Served
              </label>
              <input
                type="number"
                name="mealsServed"
                value={stats.mealsServed}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Treatments
              </label>
              <input
                type="number"
                name="treatments"
                value={stats.treatments}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Adoptions
              </label>
              <input
                type="number"
                name="adoptions"
                value={stats.adoptions}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Approved Volunteers (automatic)
              </label>
              <input
                type="number"
                name="volunteers"
                value={stats.volunteers}
                readOnly
                className="input input-bordered w-full opacity-65"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Cities Covered
              </label>
              <input
                type="number"
                name="citiesCovered"
                value={stats.citiesCovered}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Partner Vets
              </label>
              <input
                type="number"
                name="partnerVets"
                value={stats.partnerVets}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Years Active
              </label>
              <input
                type="number"
                name="yearsActive"
                value={stats.yearsActive}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
