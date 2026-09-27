'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import PublicSiteGate from '@/components/PublicSiteGate';
import { CheckCircle2, PawPrint, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    if (!selectedAnimal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedAnimal]);

  function closeAdoptionForm() {
    setSelectedAnimal(null);
    setSubmitted(false);
    setSubmitError('');
    reset();
  }

  async function submitAdoption(data) {
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/adoption-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, animalId: selectedAnimal._id }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Could not submit adoption application.');
      setAnimals((current) => current.map((animal) => (
        animal._id === selectedAnimal._id ? { ...animal, status: 'pending' } : animal
      )));
      setSelectedAnimal((current) => current ? { ...current, status: 'pending' } : current);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Could not submit adoption application.');
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchAnimals() {
    try {
      const res = await fetch('/api/animals', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        // Filter only available animals for public view
        const available = data.data.filter(a => a.status === 'available' || a.status === 'pending');
        setAnimals(available);
        const requestedAnimal = new URLSearchParams(window.location.search).get('animal');
        if (requestedAnimal) {
          const match = available.find((animal) => animal._id === requestedAnimal || animal.name === requestedAnimal);
          if (match) setSelectedAnimal(match);
        }
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnimals = filter === 'all' 
    ? animals 
    : animals.filter(a => a.type === filter);
  const categories = [
    { value: 'Dog', label: 'Dogs' },
    { value: 'Cat', label: 'Cats' },
    { value: 'Other', label: 'Other' },
  ].filter(category => animals.some(animal => animal.type === category.value));

  return (
    <PublicSiteGate><main className="public-page min-h-screen bg-base-200">
      <Navbar />
      
      <div className="pt-28 pb-14 sm:pt-32 sm:pb-16">
        <Container>
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Find a Friend
            </span>
            <h1 className="mb-4 text-[2.4rem] font-black tracking-[-0.055em] text-primary sm:text-5xl">
              Animals for Adoption
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-primary/65 sm:text-lg">
              Give a loving home to a rescued animal. These furry friends are waiting for their forever families.
            </p>
          </div>

          {/* Filter */}
          <div className="mobile-scroll-row mb-8 flex gap-2 sm:mb-12 sm:flex-wrap sm:justify-center sm:gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`min-h-11 shrink-0 rounded-full px-6 py-2 font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary hover:bg-primary/10'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`min-h-11 shrink-0 rounded-full px-6 py-2 font-medium transition-colors ${
                  filter === category.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary hover:bg-primary/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Animals Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#164020] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#401E01]/60 text-lg">No animals available for adoption at the moment.</p>
              <p className="text-[#401E01]/40 mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAnimals.map((animal, index) => (
                <Card key={animal._id} className="flex h-full flex-col overflow-hidden" padding="none">
                  <div className="relative aspect-square">
                    <Image
                      src={animal.image}
                      alt={animal.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        animal.status === 'available' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {animal.status === 'available' ? 'Available' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-primary sm:text-lg">{animal.name}</h3>
                      <span className="text-xs text-primary/60 sm:text-sm">{animal.type}</span>
                    </div>
                    <p className="mb-3 text-xs text-primary/70 sm:text-sm">{animal.breed} • {animal.age}</p>
                    <p className="mb-4 hidden min-h-[3.5rem] text-sm text-primary/60 line-clamp-2 sm:block">
                      {animal.description}
                    </p>
                    <div className="hidden min-h-[2rem] flex-wrap content-start gap-2 sm:flex">
                      {animal.vaccinated && (
                        <span className="px-2 py-1 bg-[#164020]/10 text-[#164020] text-xs rounded-full">
                          ✓ Vaccinated
                        </span>
                      )}
                      {animal.neutered && (
                        <span className="px-2 py-1 bg-[#164020]/10 text-[#164020] text-xs rounded-full">
                          ✓ Neutered
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={animal.status !== 'available'}
                      onClick={() => setSelectedAnimal(animal)}
                      className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-3 text-xs font-bold text-white transition-colors hover:bg-[#164a36] disabled:cursor-not-allowed disabled:bg-primary/10 disabled:text-primary/45 sm:text-sm"
                    >
                      <PawPrint className="h-4 w-4" /> {animal.status === 'available' ? 'Apply to adopt' : 'Application pending'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </div>

      {selectedAnimal && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/60 sm:items-center sm:justify-center sm:p-4" onClick={closeAdoptionForm}>
          <div className="max-h-[94svh] w-full overflow-y-auto rounded-t-[1.75rem] bg-base-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-xl sm:rounded-[1.75rem] sm:p-8" onClick={(event) => event.stopPropagation()}>
            {submitted ? (
              <div className="py-10 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"><CheckCircle2 className="h-8 w-8" /></span>
                <h2 className="mt-5 text-2xl font-black text-primary">Application received.</h2>
                <p className="mt-2 text-primary/60">The LAHIT team will contact you about {selectedAnimal.name}.</p>
                <button type="button" onClick={closeAdoptionForm} className="mt-7 min-h-11 rounded-full bg-primary px-6 font-bold text-white">Done</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><span className="text-xs font-black uppercase tracking-[0.12em] text-secondary">Adoption application</span><h2 className="mt-2 break-words text-xl font-black text-primary sm:text-2xl">Give {selectedAnimal.name} a home</h2></div>
                  <button type="button" onClick={closeAdoptionForm} className="btn btn-ghost btn-circle btn-sm" aria-label="Close adoption form"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit(submitAdoption)} className="mt-6 grid gap-4 sm:grid-cols-2">
                  {submitError && <div className="alert alert-error text-sm sm:col-span-2"><span>{submitError}</span></div>}
                  <label className="block"><span className="mb-1 block text-sm font-medium text-primary">Full name</span><input {...register('applicantName', { required: 'Name is required' })} className="input input-bordered w-full" />{errors.applicantName && <small className="mt-1 block text-error">{errors.applicantName.message}</small>}</label>
                  <label className="block"><span className="mb-1 block text-sm font-medium text-primary">Email</span><input type="email" {...register('email', { required: 'Email is required' })} className="input input-bordered w-full" />{errors.email && <small className="mt-1 block text-error">{errors.email.message}</small>}</label>
                  <label className="block"><span className="mb-1 block text-sm font-medium text-primary">Phone</span><input type="tel" {...register('phone', { required: 'Phone is required' })} className="input input-bordered w-full" />{errors.phone && <small className="mt-1 block text-error">{errors.phone.message}</small>}</label>
                  <label className="block"><span className="mb-1 block text-sm font-medium text-primary">City / location</span><input {...register('location', { required: 'Location is required' })} className="input input-bordered w-full" />{errors.location && <small className="mt-1 block text-error">{errors.location.message}</small>}</label>
                  <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-medium text-primary">Home type</span><select {...register('homeType', { required: 'Home type is required' })} defaultValue="" className="select select-bordered w-full"><option value="" disabled>Select your home</option>{['Apartment', 'Independent house', 'Farm', 'Other'].map((type) => <option key={type}>{type}</option>)}</select>{errors.homeType && <small className="mt-1 block text-error">{errors.homeType.message}</small>}</label>
                  <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-medium text-primary">Previous pet experience <span className="font-normal text-primary/45">(optional)</span></span><textarea {...register('experience')} rows={2} className="textarea textarea-bordered w-full" /></label>
                  <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-medium text-primary">Anything else we should know? <span className="font-normal text-primary/45">(optional)</span></span><textarea {...register('message')} rows={2} className="textarea textarea-bordered w-full" /></label>
                  <button type="submit" disabled={submitting} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-white disabled:opacity-50 sm:col-span-2"><PawPrint className="h-4 w-4" /> {submitting ? 'Submitting…' : `Apply for ${selectedAnimal.name}`}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main></PublicSiteGate>
  );
}
