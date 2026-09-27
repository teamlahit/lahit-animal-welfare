import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'LAHIT - Animal Welfare' },
  siteDescription: { type: String, default: 'Helping animals in Uttarakhand' },
  contactEmail: { type: String, default: 'contact@lahit.org' },
  contactPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' },
  maintenanceMode: { type: Boolean, default: false },
  
  // Donation settings
  upiId: { type: String, default: '' },
  bankAccountName: { type: String, default: 'LAHIT Animal Welfare' },
  bankAccountNumber: { type: String, default: '' },
  bankIfscCode: { type: String, default: '' },
  bankName: { type: String, default: '' },
  bankBranch: { type: String, default: '' },
  
  // Donation tiers
  donationTiers: { type: Array, default: [] },
  
  // Instagram posts
  instagramPosts: { type: Array, default: []},
  
  // Rescue locations
  rescueLocations: { type: Array, default: [] },
  
  // Volunteer activities
  volunteerActivities: { type: Array, default: [
    'Animal Rescue Operations',
    'Daily Feeding Drives',
    'Medical Assistance',
    'Adoption Events',
    'Community Awareness',
    'Foster Care'
  ]},
  
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
