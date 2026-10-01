'use client';

import { useState, useEffect } from 'react';
import { Check, X, Trash2, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });
  const [invitingId, setInvitingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [resendTarget, setResendTarget] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    try {
      const res = await fetch('/api/volunteers');
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.data);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setProcessingId(id);
    const previousStatus = volunteers.find(v => v._id === id)?.status;
    setVolunteers(prev => prev.map(v => 
      v._id === id ? { ...v, status } : v
    ));

    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!data.success) {
        setVolunteers(prev => prev.map(v => 
          v._id === id ? { ...v, status: previousStatus } : v
        ));
      } else window.dispatchEvent(new Event('volunteers-changed'));
    } catch (error) {
      console.error('Error updating status:', error);
      setVolunteers(prev => prev.map(v => 
        v._id === id ? { ...v, status: previousStatus } : v
      ));
    } finally {
      setProcessingId(null);
    }
  }

   async function approveAndInvite(id) {
    setInvitingId(id);
    setInviteLink(null);
    setInviteMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'approved' } : v));
        window.dispatchEvent(new Event('volunteers-changed'));
        setInviteLink(data.data?.setNewPasswordLink || null);
        setInviteMessage({
          type: data.data?.mailSent || data.data?.setNewPasswordLink ? 'success' : 'error',
          text: data.data?.mailSent
            ? 'Volunteer approved and account setup email sent.'
            : data.data?.setNewPasswordLink
            ? 'Email delivery is not configured; use the setup link below.'
            : 'Volunteer approved, but the account setup email could not be sent.',
        });
      }
      else setInviteMessage({ type: 'error', text: data.error || 'Could not approve volunteer.' });
    } catch (error) {
      console.error('Error approving volunteer:', error);
      setInviteMessage({ type: 'error', text: 'Could not approve volunteer.' });
    } finally {
      setInvitingId(null);
    }
  }

  async function resendInvite(id) {
    setResendingId(id);
    setInviteLink(null);
    setInviteMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-invite' }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteLink(data.data?.setNewPasswordLink || null);
        setInviteMessage({
          type: data.data?.mailSent || data.data?.setNewPasswordLink ? 'success' : 'error',
          text: data.data?.mailSent
            ? 'Account setup email re-sent to the volunteer.'
            : data.data?.setNewPasswordLink
            ? 'Email delivery is not configured; use the setup link below.'
            : 'Could not re-send the account setup email.',
        });
      } else {
        setInviteMessage({ type: 'error', text: data.error || 'Could not re-send the account setup email.' });
      }
    } catch (error) {
      console.error('Error resending invite:', error);
      setInviteMessage({ type: 'error', text: 'Could not re-send the account setup email.' });
    } finally {
      setResendingId(null);
    }
  }

  async function deleteVolunteer(id) {
    setDeletingId(id);
    
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setVolunteers(prev => prev.filter(v => v._id !== id));
        window.dispatchEvent(new Event('volunteers-changed'));
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    } finally {
      setDeletingId(null);
    }
  }

  function openDeleteDialog(volunteer) {
    setDeleteTarget(volunteer);
  }

  const filteredVolunteers = filter === 'all' 
    ? volunteers 
    : volunteers.filter(v => v.status === filter);

  const statusColors = {
    pending: 'badge-warning',
    contacted: 'badge-info',
    approved: 'badge-success',
    rejected: 'badge-error'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">Volunteer Applications</h1>
        <div
          role="tablist"
          aria-label="Filter volunteer applications"
          className="flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-1 shadow-sm md:w-auto"
        >
          {['all', 'pending', 'contacted', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              role="tab"
              aria-selected={filter === status}
              className={`min-h-10 shrink-0 rounded-xl border-0 px-4 text-xs font-bold capitalize transition-all ${
                filter === status
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'bg-transparent text-primary/60 hover:bg-base-200 hover:text-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {inviteLink && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
          <p className="text-sm font-semibold text-primary">Volunteer approved. Share this link so they can set their password:</p>
          <div className="mt-2 flex items-center gap-2">
            <a href={inviteLink} target="_blank" rel="noreferrer" className="truncate text-accent break-all font-medium">
              {typeof window !== 'undefined' ? window.location.origin + inviteLink : inviteLink}
            </a>
            <button
              onClick={() => { if (typeof window !== 'undefined') navigator.clipboard.writeText(window.location.origin + inviteLink); }}
              className="btn btn-xs btn-ghost btn-square"
              title="Copy link"
            >
              copy
            </button>
          </div>
        </div>
      )}

      {inviteMessage.text && !inviteLink && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${inviteMessage.type === 'error' ? 'border-error/20 bg-error/10 text-error' : 'border-success/20 bg-success/10 text-success'}`}>
          {inviteMessage.text}
        </div>
      )}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {filteredVolunteers.length === 0 ? (
            <div className="text-center text-primary/60 py-8">
              No volunteer applications found.
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer._id} className="py-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-primary">{volunteer.name}</h3>
                        <span className={`badge ${statusColors[volunteer.status] || 'badge-neutral'} badge-sm`}>
                          {volunteer.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-primary/70">
                        <a href={`mailto:${volunteer.email}`} className="flex items-center gap-1 hover:text-primary">
                          <Mail className="w-4 h-4" />
                          {volunteer.email}
                        </a>
                        <a href={`tel:${volunteer.phone}`} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="w-4 h-4" />
                          {volunteer.phone}
                        </a>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {volunteer.location}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary/70">{Array.isArray(volunteer.interest) ? volunteer.interest.join(', ') : volunteer.interest}</span>
                      </div>

                      {volunteer.message && (
                        <p className="mt-2 text-sm text-primary/60 italic">
                          &quot;{volunteer.message}&quot;
                        </p>
                      )}

                      <p className="mt-2 text-xs text-primary/40">
                        Applied on: {new Date(volunteer.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {volunteer.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(volunteer._id, 'contacted')}
                          disabled={processingId === volunteer._id}
                          className="btn btn-sm btn-info"
                          title="Mark contacted"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      {(volunteer.status === 'pending' || volunteer.status === 'contacted') && (
                        <>
                           <button
                             onClick={() => approveAndInvite(volunteer._id)}
                             disabled={processingId === volunteer._id || invitingId === volunteer._id}
                             className="btn btn-sm btn-success"
                             title="Approve and issue credentials"
                           >
                             {invitingId === volunteer._id ? (
                               <span className="loading loading-spinner loading-sm" />
                             ) : (
                               <Check className="w-4 h-4" />
                             )}
                          </button>
                          <button
                            onClick={() => updateStatus(volunteer._id, 'rejected')}
                            disabled={processingId === volunteer._id}
                            className="btn btn-sm btn-error"
                            title="Reject"
                          >
                            {processingId === volunteer._id ? (
                              <span className="loading loading-spinner loading-sm" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {volunteer.status === 'approved' && (
                        <button
                          onClick={() => {
                            setResendTarget(volunteer);
                          }}
                          disabled={resendingId === volunteer._id}
                          className="btn btn-sm btn-ghost"
                          title="Resend account setup email"
                          aria-label="Resend account setup email"
                        >
                          {resendingId === volunteer._id ? <span className="loading loading-spinner loading-sm" /> : <Mail className="w-4 h-4" />}
                        </button>
                      )}
                        {(volunteer.status === 'contacted' || volunteer.status === 'rejected' || volunteer.status === 'approved') && (
                        <button
                          onClick={() => openDeleteDialog(volunteer)}
                          disabled={deletingId === volunteer._id}
                          className="btn btn-sm btn-error"
                          title="Remove"
                        >
                          {deletingId === volunteer._id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-volunteer-title"
              className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-6 pb-4 pt-5">
                <h3 id="delete-volunteer-title" className="text-xl font-semibold text-primary">
                  Delete volunteer?
                </h3>
                <p className="mt-3 text-sm text-base-content/70">
                  Are you sure you want to delete {deleteTarget.name}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-base-200 bg-base-200/40 px-6 py-4">
                <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  disabled={deletingId === deleteTarget._id}
                  onClick={() => {
                    const target = deleteTarget;
                    setDeleteTarget(null);
                    deleteVolunteer(target._id);
                  }}
                >
                  {deletingId === deleteTarget._id ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {resendTarget && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setResendTarget(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-primary">Resend credentials to {resendTarget.name}?</h3>
              <p className="mt-3 text-sm text-primary/70">
                A new set-password link will be emailed to {resendTarget.email}.
              </p>
              <p className="mt-3 rounded-xl bg-warning/10 p-3 text-xs font-semibold text-warning">
                Warning: if this volunteer has already set a password, using the new link will reset it.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setResendTarget(null)} className="btn btn-sm btn-ghost">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = resendTarget;
                    setResendTarget(null);
                    resendInvite(target._id);
                  }}
                  disabled={resendingId === resendTarget._id}
                  className="btn btn-sm btn-success"
                >
                  {resendingId === resendTarget._id ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Send credentials
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
