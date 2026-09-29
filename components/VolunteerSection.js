'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, CheckCircle2, Send, X, Loader2 } from 'lucide-react';
import Container from './ui/Container';
import Button from './ui/Button';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { getClientJson } from '@/lib/client-fetch';

export default function VolunteerSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [volunteerImage, setVolunteerImage] = useState({
    src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
    alt: 'LAHIT Volunteers',
  });
  const [activities, setActivities] = useState([
    'Animal Rescue Operations',
    'Daily Feeding Drives',
    'Medical Assistance',
    'Adoption Events',
    'Community Awareness',
    'Foster Care',
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getClientJson('/api/settings');
        if (data.success) {
          if (data.data.volunteerActivities && data.data.volunteerActivities.length > 0) {
            setActivities(data.data.volunteerActivities);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
    getClientJson('/api/media/homepage')
      .then((data) => {
        if (data.success && data.data.volunteer) {
          setVolunteerImage({
            src: data.data.volunteer.url,
            alt: data.data.volunteer.alt || 'LAHIT Volunteers',
          });
        }
      })
      .catch(() => {});
    getClientJson('/api/stats')
      .then((data) => { if (data.success) setVolunteerCount(data.data.volunteers || 0); })
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
    watch,
  } = useForm();

  const selectedInterests = watch('interest', []);
  const selectedInterestValues = Array.isArray(selectedInterests)
    ? selectedInterests
    : selectedInterests
      ? [selectedInterests]
      : [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsFormOpen(false);
          reset();
        }, 3000);
      } else setSubmitError(result.error || 'Could not submit your application.');
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitError('Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="volunteer" className="section-padding bg-base-200 overflow-hidden" ref={sectionRef}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] sm:rounded-3xl">
              <Image
                src={volunteerImage.src}
                alt={volunteerImage.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute right-3 bottom-3 max-w-[230px] rounded-2xl bg-base-100 p-4 shadow-xl sm:-right-6 sm:-bottom-6 sm:max-w-xs sm:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{volunteerCount}+</p>
                  <p className="text-sm text-primary/70">Active Volunteers</p>
                </div>
              </div>
              <p className="text-sm text-primary/70">
                Join our growing community of animal lovers making a difference.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="badge badge-primary badge-outline badge-lg mb-4">
              Join Our Team
            </span>
            <h2 className="mb-5 text-[2rem] font-bold tracking-[-0.04em] text-primary sm:text-4xl lg:mb-6 lg:text-5xl">
              Become a Volunteer
            </h2>
            <p className="text-lg text-primary/70 mb-8 leading-relaxed">
              Join our mission to help animals in Uttarakhand. Whether you have 
              an hour a week or can dedicate more time, there&apos;s a place for you
              in our volunteer team.
            </p>

            {/* Activities List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-primary">{activity}</span>
                  </motion.div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              size="lg"
              icon={Users}
            >
              Join as Volunteer
            </Button>
          </motion.div>
        </div>
      </Container>

      {/* Volunteer Form Modal */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end bg-black/60 p-0 sm:items-center sm:justify-center sm:p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-h-[94svh] overflow-y-auto rounded-t-[1.75rem] bg-base-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary-content" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  Application Submitted!
                </h3>
                <p className="text-primary/70">
                  We&apos;ll contact you soon with next steps.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h3 className="min-w-0 text-xl font-bold text-primary sm:text-2xl">
                    Volunteer Application
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="btn btn-ghost btn-circle btn-sm shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {submitError && <div className="alert alert-error text-sm"><span>{submitError}</span></div>}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="input input-bordered w-full"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-error text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="input input-bordered w-full"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-error text-sm mt-1">{errors.email.message}</p>
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
                      City/Location
                    </label>
                    <input
                      {...register('location', { required: 'Location is required' })}
                      className="input input-bordered w-full"
                      placeholder="Enter your city"
                    />
                    {errors.location && (
                      <p className="text-error text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Areas of Interest
                    </label>
                    <fieldset className="rounded-2xl border border-base-300 bg-base-200/50 p-2 sm:p-3">
                      <legend className="sr-only">Select one or more areas of interest</legend>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {activities.map((activity) => {
                          const isSelected = selectedInterestValues.includes(activity);

                          return (
                            <label
                              key={activity}
                              className={`flex min-h-15 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-5 transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-transparent bg-base-100 text-primary/75 hover:border-primary/30'
                              }`}
                            >
                              <input
                                {...register('interest', { required: 'Please select an area' })}
                                type="checkbox"
                                value={activity}
                                className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0"
                              />
                              <span>{activity}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <p className="mt-1 text-xs text-primary/55">Choose one or more areas.</p>
                    {errors.interest && (
                      <p className="text-error text-sm mt-1">{errors.interest.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      {...register('message')}
                      rows={3}
                      className="textarea textarea-bordered w-full"
                      placeholder="Tell us why you want to volunteer"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
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
