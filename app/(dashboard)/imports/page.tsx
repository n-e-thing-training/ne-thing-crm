import { SectionHeader } from "@/components/section-header";
import { listImportClassOptions, listImports, importRosterAction } from "@/lib/actions/imports";

export default async function ImportsPage() {
  const [imports, classes] = await Promise.all([listImports(), listImportClassOptions()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Roster Imports"
        description="Upload CSV/XLSX roster files, map fields, and create participants + registrations."
      />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Import Roster</h3>
        <form action={importRosterAction} className="grid gap-3 md:grid-cols-2">
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
          <input name="file" type="file" accept=".csv,.xlsx" required />
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Process Import
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Supported columns: <span className="font-mono">first_name,last_name,email,phone</span>.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Import History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Rows</th>
                <th className="py-2 pr-4">New Participants</th>
                <th className="py-2 pr-4">New Registrations</th>
                <th className="py-2 pr-4">Duplicates</th>
                <th className="py-2 pr-4">Errors</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{item.file_name}</td>
                  <td className="py-2 pr-4">{item.total_rows}</td>
                  <td className="py-2 pr-4">{item.created_participants}</td>
                  <td className="py-2 pr-4">{item.created_registrations}</td>
                  <td className="py-2 pr-4">{item.duplicate_rows}</td>
                  <td className="py-2 pr-4">{item.error_rows}</td>
                  <td className="py-2 pr-4">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
