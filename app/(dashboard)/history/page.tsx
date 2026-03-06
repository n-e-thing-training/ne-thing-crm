import { SectionHeader } from "@/components/section-header";
import { listAuditLogs, listCommunicationHistory } from "@/lib/actions/history";

export default async function HistoryPage() {
  const [communications, auditLogs] = await Promise.all([listCommunicationHistory(), listAuditLogs()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="History" description="Permanent communication and audit trail." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Communication History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Recipient</th>
                <th className="py-2 pr-4">Delivery</th>
                <th className="py-2 pr-4">Message</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-4">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="py-2 pr-4 uppercase">{item.channel}</td>
                  <td className="py-2 pr-4">{item.recipient}</td>
                  <td className="py-2 pr-4">{item.delivery_status ?? "-"}</td>
                  <td className="py-2 pr-4 text-xs text-slate-600">{item.message_body.slice(0, 140)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Audit Logs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">Entity ID</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">{item.actor_email ?? "system"}</td>
                  <td className="py-2 pr-4">{item.entity_type}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{item.entity_id}</td>
                  <td className="py-2 pr-4">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
