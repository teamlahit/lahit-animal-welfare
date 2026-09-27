'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Camera, MapPin, Send, MessageCircle, X } from 'lucide-react';
import Container from './ui/Container';
import Button from './ui/Button';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

export default function EmergencyRescue() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [reportImage, setReportImage] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.contactPhone) setContactPhone(data.data.contactPhone);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setVolunteerCount(Number(data.data.volunteers) || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isFormOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isFormOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/rescue-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: data.name,
          phone: data.phone,
          animalType: data.animalType || 'Other',
          location: data.location,
          description: data.description,
          image: reportImage,
        })
      });
      const result = await res.json();

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsFormOpen(false);
          reset();
          setReportImage('');
        }, 3000);
      } else setSubmitError(result.error || 'Could not submit the report. Please call us instead.');
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitError('Could not submit the report. Please call us instead.');
    } finally {
      setSubmitting(false);
    }
  };

  function handleImageUpload(file) {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('Photo must be smaller than 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sourceImage = new window.Image();
      sourceImage.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(sourceImage.width, sourceImage.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(sourceImage.width * scale);
        canvas.height = Math.round(sourceImage.height * scale);
        canvas.getContext('2d').drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        setReportImage(canvas.toDataURL('image/webp', 0.78));
      };
      sourceImage.onerror = () => setImageError('Could not read this photo. Please choose another one.');
      sourceImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  const whatsappNumber = contactPhone.replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent('Emergency: I found an injured animal that needs help.');

  return (
    <section
      id="emergency"
      className="section-padding bg-secondary relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Emergency Rescue
            </div>

            <h2 className="mb-5 text-[2rem] font-bold tracking-[-0.04em] text-white sm:text-4xl lg:mb-6 lg:text-5xl">
              Found an Injured Animal?
            </h2>

            <p className="mb-7 text-base leading-relaxed text-white/90 sm:mb-8 sm:text-lg">
              If you come across an injured, sick, or distressed animal,
              please submit a rescue report. Our team reviews reports and
              coordinates help for animals in need across Uttarakhand.
            </p>

            <div className="mb-7 space-y-3 sm:mb-8 sm:space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Take a Photo</h4>
                  <p className="text-white/80 text-sm">
                    Click a clear picture of the animal and its surroundings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Share Location</h4>
                  <p className="text-white/80 text-sm">
                    Send us the exact location where the animal was found
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Team Review</h4>
                  <p className="text-white/80 text-sm">
                    Our team reviews the report and coordinates the next steps
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setIsFormOpen(true)}
                variant="outlineWhite"
                size="lg"
                icon={Send}
                className="border-2 border-white"
              >
                Report Rescue
              </Button>
              {whatsappNumber && (
                <Button href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} variant="primary" size="lg" icon={MessageCircle} className="bg-[#25D366] hover:bg-[#128C7E] border-none">
                  WhatsApp Rescue Team
                </Button>
              )}
            </div>
          </motion.div>

          {/* Right Content - Illustration/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[1.5rem] bg-base-100 p-6 shadow-2xl sm:rounded-3xl sm:p-8">
              {/* Emergency Contact Card */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Emergency Hotline
                </h3>
                <p className="text-primary/70 mb-4">Call us or submit a rescue report</p>
                {contactPhone ? (
                  <a href={`tel:${contactPhone}`} className="break-all text-2xl font-bold text-secondary transition-colors hover:text-secondary/80 sm:text-3xl">{contactPhone}</a>
                ) : (
                  <p className="text-sm font-semibold text-secondary">Submit the rescue form for a callback</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="pt-6 text-center border-t border-base-300">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{volunteerCount}+</p>
                  <p className="text-sm text-primary/70">Active Volunteers</p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -top-4 right-3 hidden rounded-full bg-primary px-4 py-2 text-primary-content shadow-lg sm:block lg:-right-4"
            >
              <span className="font-semibold">We are here to help!</span>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Report Form Modal */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center overflow-hidden bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="rescue-report-sheet overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[1.5rem] bg-base-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-[1.75rem] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary-content" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Report Submitted!
                </h3>
                <p className="text-primary/70">
                  Our team will contact you shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
                  <h3 className="min-w-0 text-xl font-bold text-primary sm:text-2xl">
                    Report Injured Animal
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="btn btn-ghost btn-circle btn-sm shrink-0"
                    aria-label="Close rescue report form"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-3 sm:space-y-4">
                  {submitError && <div className="alert alert-error text-sm"><span>{submitError}</span></div>}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Your Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="input input-bordered w-full"
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="text-error text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      className="input input-bordered w-full"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-error text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Animal Type
                    </label>
                    <select {...register('animalType')} className="select select-bordered w-full" defaultValue="Other">
                      {['Dog', 'Cat', 'Cow', 'Bird', 'Other'].map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Location
                    </label>
                    <input
                      {...register('location', { required: 'Location is required' })}
                      className="input input-bordered w-full"
                      placeholder="Enter the location"
                    />
                    {errors.location && (
                      <p className="text-error text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={2}
                      className="textarea textarea-bordered w-full"
                      placeholder="Describe the animal and its condition"
                    />
                    {errors.description && (
                      <p className="text-error text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Photo <span className="font-normal text-primary/45">(recommended)</span>
                    </label>
                    <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.07]">
                      <Camera className="h-4 w-4" /> {reportImage ? 'Replace photo' : 'Take or upload a photo'}
                      <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => handleImageUpload(event.target.files?.[0])} />
                    </label>
                    {reportImage && <Image src={reportImage} alt="Rescue report preview" width={600} height={240} unoptimized className="mt-3 h-24 w-full rounded-xl object-cover sm:h-28" />}
                    {imageError && <p className="text-error text-sm mt-1">{imageError}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full"
                    loading={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
