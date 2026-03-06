import { SectionHeader } from "@/components/section-header";
import { listAccounts } from "@/lib/actions/accounts";
import { createContactAction, listContacts } from "@/lib/actions/contacts";

export default async function ContactsPage() {
  const [contacts, accounts] = await Promise.all([listContacts(), listAccounts()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Contacts" description="People at client organizations." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Contact</h3>
        <form action={createContactAction} className="grid gap-3 md:grid-cols-2">
          <select name="accountId" required defaultValue="">
            <option value="" disabled>
              Select account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input name="role" placeholder="Role" />
          <input name="firstName" placeholder="First name" required />
          <input name="lastName" placeholder="Last name" required />
          <input name="email" type="email" placeholder="Email" />
          <input name="phone" placeholder="Phone" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPrimary" />
            Primary contact for account
          </label>
          <textarea className="md:col-span-2" name="notes" placeholder="Notes" rows={3} />
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Contact
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Contact List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Account</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Primary</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{contact.first_name} {contact.last_name}</td>
                  <td className="py-2 pr-4">{(contact.accounts as { name?: string } | null)?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{contact.role ?? "-"}</td>
                  <td className="py-2 pr-4">{contact.email ?? "-"}</td>
                  <td className="py-2 pr-4">{contact.phone ?? "-"}</td>
                  <td className="py-2 pr-4">{contact.is_primary ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
