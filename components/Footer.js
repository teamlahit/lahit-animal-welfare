'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Youtube,
  ArrowUp,
} from 'lucide-react';
import Container from './ui/Container';
import Image from 'next/image';
import Link from 'next/link';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/#about' },
  { name: 'Uttarkashi Animal Rescue', href: '/uttarkashi/' },
  { name: 'Rescue Stories', href: '/#stories' },
  { name: 'Adopt', href: '/animals' },
  { name: 'Field Notes', href: '/blog' },
  { name: 'Volunteer', href: '/#volunteer' },
  { name: 'Donate', href: '/#donate' },
];

const services = [
  { name: 'Animal Rescue', href: '/#emergency' },
  { name: 'Medical Treatment', href: '/#about' },
  { name: 'Adoption', href: '/animals' },
  { name: 'Feeding Programs', href: '/#about' },
  { name: 'Sterilization', href: '/#about' },
  { name: 'Awareness Camps', href: '/#volunteer' },
];

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => { if (data.success) setSettings(data.data); })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: settings?.instagram || 'https://instagram.com/lahitanimalwelfaregroup' },
    { name: 'Facebook', icon: Facebook, href: settings?.facebook },
    { name: 'YouTube', icon: Youtube, href: settings?.youtube },
  ].filter((social) => social.href);
  const contactEmail = settings?.contactEmail || 'contact@lahitanimalwelfaregroup.com';
  const contactPhone = settings?.contactPhone || '';
  const address = settings?.address || 'Dehradun, Uttarakhand, India';
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-content">
      {/* Main Footer */}
      <div className="section-padding">
        <Container>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-base-100 shadow-md">
                  <Image
                    src="/lahit.png"
                    alt="LAHIT Animal Welfare Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-2xl font-bold">LAHIT</span>
              </div>
              <p className="text-primary-content/70 mb-6 leading-relaxed">
                {settings?.siteDescription || 'A volunteer-led animal rescue initiative dedicated to helping stray and injured animals across Uttarakhand, India.'}
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-content/10 rounded-full flex items-center justify-center hover:bg-primary-content/20 transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-primary-content/70 hover:text-primary-content hover:translate-x-1 inline-block transition-all"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="min-w-0">
              <h4 className="text-lg font-semibold mb-6">Our Services</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-primary-content/70 hover:text-primary-content hover:translate-x-1 inline-block transition-all"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-start gap-3 text-primary-content/70 hover:text-primary-content transition-colors"
                  >
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="break-all">{contactEmail}</span>
                  </a>
                </li>
                {contactPhone && <li>
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-start gap-3 text-primary-content/70 hover:text-primary-content transition-colors"
                  >
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{contactPhone}</p>
                      <p className="text-sm text-primary-content/50">Emergency Hotline</p>
                    </div>
                  </a>
                </li>}
                <li className="flex items-start gap-3 text-primary-content/70">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Disclaimer Bar */}
      <div className="border-t border-primary-content/10 py-6">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-content/60 text-sm text-center md:text-left">
              LAHIT Animal Welfare is a volunteer-led animal rescue initiative. 
              We are not a registered NGO yet but operate with full transparency 
              and dedication to animal welfare.
            </p>
            <motion.button
              onClick={scrollToTop}
              className="btn btn-circle btn-sm bg-primary-content/20 hover:bg-primary-content/30 border-none text-primary-content"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
        </Container>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-primary-content/10 py-4">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-primary-content/50">
            <p>
              © {new Date().getFullYear()} LAHIT Animal Welfare. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy/" className="hover:text-primary-content transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms/" className="hover:text-primary-content transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
