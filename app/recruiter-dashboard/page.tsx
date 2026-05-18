import {
  Briefcase,
  FileText,
  TrendingUp,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function RecruiterDashboardPage() {
  // Dummy data for dashboard metrics
  const metrics = [
    {
      label: "Active Jobs",
      value: "12",
      change: "+2 this week",
      trend: "up",
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
    },
    {
      label: "Total Applications",
      value: "248",
      change: "+18% from last month",
      trend: "up",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    },
    {
      label: "Interviews Scheduled",
      value: "14",
      change: "4 for today",
      trend: "neutral",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20",
    },
    {
      label: "Profile Views",
      value: "1.2k",
      change: "+5.2% this week",
      trend: "up",
      icon: Eye,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
  ];

  // Dummy recent applications
  const recentApplications = [
    { id: 1, name: "Sarah Jenkins", role: "Senior Frontend Engineer", status: "Reviewing", time: "2 hours ago", avatar: "SJ" },
    { id: 2, name: "Michael Chen", role: "Backend Developer", status: "Interviewed", time: "5 hours ago", avatar: "MC" },
    { id: 3, name: "Jessica Smith", role: "UX Designer", status: "New", time: "1 day ago", avatar: "JS" },
    { id: 4, name: "David Kim", role: "Product Manager", status: "Offer Sent", time: "1 day ago", avatar: "DK" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John!</h1>
          <p className="text-foreground/60 mt-1">Here is what's happening with your job listings today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <TrendingUp className={`w-5 h-5 ${metric.trend === 'up' ? 'text-emerald-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-foreground/60">{metric.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-medium text-foreground/50">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link href="/recruiter-dashboard/manage-applications" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {app.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{app.name}</h4>
                    <p className="text-sm text-foreground/60">{app.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${app.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                      ${app.status === 'Reviewing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                      ${app.status === 'Interviewed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                      ${app.status === 'Offer Sent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}
                    `}>
                      {app.status}
                    </span>
                    <p className="text-xs text-foreground/50 mt-1">{app.time}</p>
                  </div>
                  <button className="text-foreground/40 hover:text-primary transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Getting Started */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Boost Your Reach</h2>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Upgrade your company profile to premium to appear higher in search results and attract top-tier engineering talent.
              </p>
              <button className="bg-white text-primary px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors w-full shadow-sm">
                Upgrade to Premium
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Tasks</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-medium">Verify company email</p>
                  <p className="text-xs text-foreground/50">Completed</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-medium">Complete company profile</p>
                  <p className="text-xs text-foreground/50">Add a logo and description</p>
                </div>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <div className="mt-0.5 text-gray-400"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-medium">Post your first job</p>
                  <p className="text-xs text-foreground/50">Start receiving applications</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
