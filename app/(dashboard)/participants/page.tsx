import { SectionHeader } from "@/components/section-header";
import { createParticipantAction, listParticipants } from "@/lib/actions/participants";

export default async function ParticipantsPage() {
  const participants = await listParticipants();

  return (
    <div className="space-y-6">
      <SectionHeader title="Participants" description="Reusable participant records across classes." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Participant</h3>
        <form action={createParticipantAction} className="grid gap-3 md:grid-cols-2">
          <input name="firstName" placeholder="First name" required />
          <input name="lastName" placeholder="Last name" required />
          <input name="email" placeholder="Email" type="email" />
          <input name="phone" placeholder="Phone" />
          <input name="certificationFirstName" placeholder="Certification first name" />
          <input name="certificationLastName" placeholder="Certification last name" />
          <input name="certificationEmail" placeholder="Certification email" type="email" />
          <input name="certificationPhone" placeholder="Certification phone" />
          <textarea className="md:col-span-2" name="notes" rows={3} placeholder="Notes" />
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Participant
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Participant List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">
                    {participant.first_name} {participant.last_name}
                  </td>
                  <td className="py-2 pr-4">{participant.email ?? "-"}</td>
                  <td className="py-2 pr-4">{participant.phone ?? "-"}</td>
                  <td className="py-2 pr-4">{new Date(participant.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
