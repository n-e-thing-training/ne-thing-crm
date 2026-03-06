import { SectionHeader } from "@/components/section-header";
import { createRegistrationAction, listRegistrationOptions, listRegistrations } from "@/lib/actions/registrations";

export default async function RegistrationsPage() {
  const [{ classes, participants }, registrations] = await Promise.all([
    listRegistrationOptions(),
    listRegistrations()
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Registrations" description="Participant enrollment and readiness state." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Registration</h3>
        <form action={createRegistrationAction} className="grid gap-3 md:grid-cols-2">
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

          <select name="participantId" required defaultValue="">
            <option value="" disabled>
              Select participant
            </option>
            {participants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.last_name}, {item.first_name}
              </option>
            ))}
          </select>

          <select name="paymentStatus" defaultValue="unknown">
            <option value="unknown">unknown</option>
            <option value="paid">paid</option>
            <option value="unpaid">unpaid</option>
          </select>

          <select name="waiverStatus" defaultValue="missing">
            <option value="missing">missing</option>
            <option value="complete">complete</option>
          </select>

          <select name="onlineStatus" defaultValue="not_started">
            <option value="not_started">not_started</option>
            <option value="complete">complete</option>
          </select>

          <textarea name="notes" rows={3} placeholder="Notes" className="md:col-span-2" />

          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Registration
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Registration List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Participant</th>
                <th className="py-2 pr-4">Class Date</th>
                <th className="py-2 pr-4">Payment</th>
                <th className="py-2 pr-4">Waiver</th>
                <th className="py-2 pr-4">Online</th>
                <th className="py-2 pr-4">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => {
                const participant = Array.isArray(registration.participants)
                  ? registration.participants[0]
                  : registration.participants;
                const classItem = Array.isArray(registration.classes) ? registration.classes[0] : registration.classes;

                return (
                  <tr key={registration.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      {participant ? `${participant.first_name} ${participant.last_name}` : "Unknown participant"}
                    </td>
                    <td className="py-2 pr-4">{classItem?.class_date ?? "TBD"}</td>
                    <td className="py-2 pr-4 capitalize">{registration.payment_status}</td>
                    <td className="py-2 pr-4 capitalize">{registration.waiver_status}</td>
                    <td className="py-2 pr-4 capitalize">{registration.online_status.replace("_", " ")}</td>
                    <td className="py-2 pr-4 capitalize">{registration.readiness_status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
