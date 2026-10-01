import Link from 'next/link';
import { ArrowUpRight, BarChart3, Dog, FileText, Heart, Siren, Users } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Animal from '@/models/Animal';
import Blog from '@/models/Blog';
import Rescue from '@/models/Rescue';
import RescueReport from '@/models/RescueReport';
import Stat from '@/models/Stat';
import Volunteer from '@/models/Volunteer';
import AdoptionInquiry from '@/models/AdoptionInquiry';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  await connectDB();
  const [rescues, animals, blogs, volunteers, pendingVolunteers, urgentReports, newAdoptions, stats, recentReports] = await Promise.all([
    Rescue.countDocuments(),
    Animal.countDocuments(),
    Blog.countDocuments(),
    Volunteer.countDocuments(),
    Volunteer.countDocuments({ status: 'pending' }),
    RescueReport.countDocuments({ status: { $in: ['new', 'reviewing', 'dispatched'] } }),
    AdoptionInquiry.countDocuments({ status: 'new' }),
    Stat.findOne().lean(),
    RescueReport.find().sort({ createdAt: -1 }).limit(4).lean(),
  ]);
  return { rescues, animals, blogs, volunteers, pendingVolunteers, urgentReports, newAdoptions, stats: stats || {}, recentReports };
}

const cards = [
  { key: 'rescues', label: 'Rescue stories', icon: Heart, href: '/admin/rescues', color: 'bg-secondary/15 text-secondary' },
  { key: 'animals', label: 'Animal profiles', icon: Dog, href: '/admin/animals', color: 'bg-accent text-primary' },
  { key: 'blogs', label: 'Blog posts', icon: FileText, href: '/admin/blogs', color: 'bg-sky-100 text-sky-700' },
  { key: 'volunteers', label: 'Volunteers', icon: Users, href: '/admin/volunteers', color: 'bg-emerald-100 text-emerald-700' },
];

const rescueStatusLabels = {
  new: 'Received',
  reviewing: 'Reviewing',
  dispatched: 'Dispatched',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Mission overview</span>
          <h2>Good evening, team.</h2>
          <p>Everything happening across rescues, adoption and community support.</p>
        </div>
        <Link href="/admin/rescue-reports" className="admin-primary-action"><Siren className="h-4 w-4" /> Open rescue inbox {data.urgentReports > 0 && <span>{data.urgentReports}</span>}</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} href={card.href} className="admin-metric-card group">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.color}`}><Icon className="h-5 w-5" /></span>
                <ArrowUpRight className="h-5 w-5 text-primary/25 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-8 text-4xl font-black tracking-[-0.06em] text-primary">{data[card.key]}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-primary/45">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><span className="admin-eyebrow">Live queue</span><h3>Latest rescue reports</h3></div>
            <Link href="/admin/rescue-reports">View all <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {data.recentReports.length === 0 ? (
            <div className="admin-empty min-h-56"><Siren className="h-7 w-7" /><p>No public rescue reports yet.</p></div>
          ) : (
            <div className="divide-y divide-primary/10">
              {data.recentReports.map((report) => (
                <Link key={report._id.toString()} href="/admin/rescue-reports" className="group grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex items-center gap-3"><span className={`admin-status admin-status-${report.status}`}>{rescueStatusLabels[report.status] || report.status}</span><p className="font-bold text-primary">{report.animalType} · {report.location}</p></div>
                    <p className="mt-2 line-clamp-1 text-sm text-primary/50">{report.description}</p>
                  </div>
                  <p className="text-xs font-semibold text-primary/35">{new Date(report.createdAt).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-5">
          <section className="admin-panel admin-attention-panel">
            <div className="flex items-center justify-between"><span className="admin-eyebrow text-accent">Needs attention</span><Siren className="h-5 w-5 text-accent" /></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div><p className="admin-attention-count text-4xl font-black tracking-[-0.06em]">{data.urgentReports}</p><p className="admin-attention-label mt-2 text-xs font-bold uppercase tracking-[0.08em]">Open rescues</p></div>
              <div><p className="admin-attention-count text-4xl font-black tracking-[-0.06em]">{data.pendingVolunteers}</p><p className="admin-attention-label mt-2 text-xs font-bold uppercase tracking-[0.08em]">New volunteers</p></div>
              <div><p className="admin-attention-count text-4xl font-black tracking-[-0.06em]">{data.newAdoptions}</p><p className="admin-attention-label mt-2 text-xs font-bold uppercase tracking-[0.08em]">Adoption requests</p></div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">Public impact</span><h3>Headline numbers</h3></div><BarChart3 className="h-5 w-5 text-primary/35" /></div>
            <div className="mt-5 space-y-3">
              {[
                ['Animals rescued', data.stats.animalsRescued || 0],
                ['Meals served', data.stats.mealsServed || 0],
                ['Treatments', data.stats.treatments || 0],
              ].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-primary/10 pb-3 text-sm"><span className="text-primary/55">{label}</span><strong className="text-primary">{value.toLocaleString()}</strong></div>)}
            </div>
            <Link href="/admin/stats" className="mt-5 flex items-center justify-between text-sm font-bold text-primary">Update statistics <ArrowUpRight className="h-4 w-4" /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
