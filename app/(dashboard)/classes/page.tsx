import { SectionHeader } from "@/components/section-header";
import { createClassAction, listAccountAndCourseOptions, listClasses } from "@/lib/actions/classes";

export default async function ClassesPage() {
  const [{ accounts, courses }, classes] = await Promise.all([listAccountAndCourseOptions(), listClasses()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Classes" description="Scheduled training sessions and logistics." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Class</h3>
        <form action={createClassAction} className="grid gap-3 md:grid-cols-3">
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

          <select name="courseId" required defaultValue="">
            <option value="" disabled>
              Select course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <select name="status" defaultValue="draft">
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="ready">ready</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>

          <input name="classDate" type="date" />
          <input name="startTime" type="time" />
          <input name="endTime" type="time" />

          <input name="instructor" placeholder="Instructor" />
          <input name="street" placeholder="Street" />
          <input name="city" placeholder="City" />
          <input name="state" placeholder="State" />
          <input name="zip" placeholder="ZIP" />

          <textarea className="md:col-span-3" name="notes" placeholder="Notes" rows={3} />
          <div className="md:col-span-3">
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Class
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Class List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Account</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Instructor</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{row.class_date ?? "TBD"}</td>
                  <td className="py-2 pr-4">{(row.accounts as { name?: string } | null)?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{(row.courses as { name?: string } | null)?.name ?? "-"}</td>
                  <td className="py-2 pr-4">{row.instructor ?? "-"}</td>
                  <td className="py-2 pr-4">{[row.city, row.state].filter(Boolean).join(", ") || "TBD"}</td>
                  <td className="py-2 pr-4 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
