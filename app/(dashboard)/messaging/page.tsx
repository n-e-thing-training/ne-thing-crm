import { randomUUID } from "node:crypto";
import { SectionHeader } from "@/components/section-header";
import {
  approveMessageBatchAction,
  createMessageBatchAction,
  listMessageBatches,
  listMessagingOptions,
  sendBatchNowAction
} from "@/lib/actions/messaging";

export default async function MessagingPage() {
  const [{ classes, templates }, batches] = await Promise.all([listMessagingOptions(), listMessageBatches()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Messaging Engine"
        description="Safe workflow: preview draft -> approve batch -> send with audit and delivery logging."
      />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Draft Batch</h3>
        <form action={createMessageBatchAction} className="grid gap-3 md:grid-cols-2">
          <select name="classId" required defaultValue="">
            <option value="" disabled>
              Select class
            </option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.class_date ?? "TBD"} - {[item.city, item.state].filter(Boolean).join(", ") || "TBD"}
              </option>
            ))}
          </select>

          <select name="channel" defaultValue="sms">
            <option value="sms">sms</option>
            <option value="email">email</option>
          </select>

          <select name="templateId" defaultValue="" className="md:col-span-2">
            <option value="">Use custom content</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.type})
              </option>
            ))}
          </select>

          <input name="subject" placeholder="Subject (email only if custom)" />
          <input name="idempotencyKey" defaultValue={randomUUID()} />
          <textarea
            className="md:col-span-2"
            name="body"
            rows={4}
            placeholder="Custom body. Leave blank to require template selection."
          />
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Create Draft
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Batches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Batch</th>
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-mono text-xs">{batch.id}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{batch.class_id}</td>
                  <td className="py-2 pr-4 uppercase">{batch.channel}</td>
                  <td className="py-2 pr-4 capitalize">{batch.status}</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <form action={approveMessageBatchAction}>
                        <input type="hidden" name="batchId" value={batch.id} />
                        <button
                          type="submit"
                          className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
                          disabled={batch.status !== "draft"}
                        >
                          Approve
                        </button>
                      </form>
                      <form action={sendBatchNowAction}>
                        <input type="hidden" name="batchId" value={batch.id} />
                        <button
                          type="submit"
                          className="rounded bg-slate-900 px-2 py-1 text-xs text-white disabled:opacity-50"
                          disabled={batch.status !== "approved"}
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
