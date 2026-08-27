import Link from "next/link";
import { dashboardStats, listCampaigns } from "@/lib/repo";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const stats = dashboardStats();
  const campaigns = listCampaigns().slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Your cold email outreach at a glance.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Contacts" value={stats.contacts} accent="text-indigo-600" />
        <StatCard label="Templates" value={stats.templates} accent="text-sky-600" />
        <StatCard label="Campaigns" value={stats.campaigns} accent="text-violet-600" />
        <StatCard label="Emails sent" value={stats.emailsSent} accent="text-emerald-600" />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent campaigns</h2>
          <Link
            href="/campaigns"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View all →
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-500">No campaigns yet.</p>
            <Link
              href="/campaigns"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Template</th>
                  <th className="px-5 py-3 font-medium">Recipients</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-3 text-slate-600">{c.template_name}</td>
                    <td className="px-5 py-3 text-slate-600">{c.sent_count}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
