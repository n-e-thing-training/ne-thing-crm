import { SectionHeader } from "@/components/section-header";
import { createAccountAction, listAccounts } from "@/lib/actions/accounts";

export default async function AccountsPage() {
  const accounts = await listAccounts();

  return (
    <div className="space-y-6">
      <SectionHeader title="Accounts" description="Client organizations purchasing training." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Account</h3>
        <form action={createAccountAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Organization name" required />
          <input name="organizationType" placeholder="Organization type" />
          <input name="billingEmail" type="email" placeholder="Billing email" />
          <input name="billingPhone" placeholder="Billing phone" />
          <input className="md:col-span-2" name="address" placeholder="Address" />
          <textarea className="md:col-span-2" name="notes" placeholder="Notes" rows={3} />
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Account
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Account List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Billing Email</th>
                <th className="py-2 pr-4">Billing Phone</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{account.name}</td>
                  <td className="py-2 pr-4">{account.organization_type ?? "-"}</td>
                  <td className="py-2 pr-4">{account.billing_email ?? "-"}</td>
                  <td className="py-2 pr-4">{account.billing_phone ?? "-"}</td>
                  <td className="py-2 pr-4">{new Date(account.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
