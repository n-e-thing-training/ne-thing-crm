import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { listClasses } from "@/lib/actions/classes";
import { listMessageBatches } from "@/lib/actions/messaging";

export default async function DashboardPage() {
  const [summary, classes, batches] = await Promise.all([
    getDashboardSummary(),
    listClasses(),
    listMessageBatches()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Operations Dashboard"
        description="Live view of class readiness, communication, and send safety."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Upcoming Classes" value={summary.upcomingClasses} hint="Classes on or after today" />
        <Card title="Blocked Registrations" value={summary.blockedRegistrations} hint="Readiness blocking issues" />
        <Card title="Missing Waivers" value={summary.missingWaivers} />
        <Card title="Unpaid Participants" value={summary.unpaidParticipants} />
        <Card title="Pending Reminder Batches" value={summary.pendingReminderBatches} hint="Draft or approved" />
        <Card title="Message Failures" value={summary.messageFailures} hint="Queue rows with failed delivery" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Upcoming Classes</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Account</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.slice(0, 10).map((classItem) => (
                <tr key={classItem.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{classItem.class_date ?? "TBD"}</td>
                  <td className="py-2 pr-4">{(classItem.accounts as { name?: string } | null)?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{(classItem.courses as { name?: string } | null)?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{[classItem.city, classItem.state].filter(Boolean).join(", ") || "TBD"}</td>
                  <td className="py-2 pr-4 capitalize">{classItem.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Recent Message Batches</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Batch ID</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Approved At</th>
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 10).map((batch) => (
                <tr key={batch.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-mono text-xs">{batch.id.slice(0, 8)}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{batch.class_id.slice(0, 8)}</td>
                  <td className="py-2 pr-4 uppercase">{batch.channel}</td>
                  <td className="py-2 pr-4 capitalize">{batch.status}</td>
                  <td className="py-2 pr-4">{batch.approved_at ? new Date(batch.approved_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
