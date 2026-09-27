'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, HeartHandshake, Loader2, PawPrint, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Container from './ui/Container';
import Card from './ui/Card';
import Button from './ui/Button';
import Link from 'next/link';

export default function AdoptionSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimals() {
      try {
        const res = await fetch('/api/animals', { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          const availableAnimals = (data.data || []).filter(
            (animal) => animal.status === 'available' || animal.status === 'pending'
          );
          setAnimals(availableAnimals.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching animals for adoption section:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimals();
  }, []);

  return (
    <section id="adoption" className="section-padding bg-base-200" ref={sectionRef}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-16"
        >
          <span className="badge badge-secondary badge-outline badge-lg mb-4">
            Adoption
          </span>
          <h2 className="mb-4 text-[2rem] font-bold tracking-[-0.04em] text-primary sm:text-4xl lg:text-5xl">
            Meet the animals waiting for a home
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-primary/70">
            Every rescued companion deserves comfort, care and a family that will love them for life.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : animals.length === 0 ? (
          <div className="py-20 text-center text-primary/60">
            No animals are available for adoption right now.
            <p className="mx-auto mt-3 max-w-lg text-sm">You can still start an adoption enquiry and tell us what kind of companion you hope to welcome. We’ll let you know when a suitable animal is ready.</p>
            <Button href="/#volunteer" variant="outline" size="md" className="mt-5" icon={ArrowRight}>Help an animal get ready for a home</Button>
          </div>
        ) : (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {animals.map((animal, index) => (
              <motion.div
                key={animal._id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={animals.length === 1 ? 'w-full justify-self-start sm:max-w-[19rem]' : ''}
              >
                <Link href={`/animals/?animal=${encodeURIComponent(animal._id || animal.name)}`} aria-label={`View ${animal.name}'s profile and adoption application`} className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <Card hover={false} className="group h-full overflow-hidden" padding="none">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={animal.image}
                      alt={animal.name}
                      fill
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-white ${
                          animal.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      >
                        {animal.status === 'available' ? 'Available' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-primary">{animal.name}</h3>
                      <span className="text-xs font-medium text-primary/60">{animal.type}</span>
                    </div>

                    <p className="text-sm text-primary/70">
                      {animal.breed} • {animal.age}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {animal.vaccinated && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[0.65rem] font-semibold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" /> Vaccinated
                        </span>
                      )}
                      {animal.neutered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-1 text-[0.65rem] font-semibold text-primary">
                          <PawPrint className="h-3.5 w-3.5" /> Neutered
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-primary/10 pt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                        <HeartHandshake className="h-4 w-4 text-secondary" />
                        {animal.status === 'available' ? 'Ready for adoption' : 'Application in progress'}
                      </span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-secondary">View profile &amp; apply <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Button href="/animals" variant="outline" size="lg" icon={ArrowRight}>
            View more
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
