import { SectionHeader } from "@/components/section-header";
import { listCourses } from "@/lib/actions/courses";
import { createMessageTemplateAction, listMessageTemplates } from "@/lib/actions/templates";

export default async function TemplatesPage() {
  const [templates, courses] = await Promise.all([listMessageTemplates(), listCourses()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Message Templates"
        description="Reusable SMS and email templates with merge variables."
      />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Template</h3>
        <form action={createMessageTemplateAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" placeholder="Template name" required />
          <select name="type" defaultValue="sms">
            <option value="sms">sms</option>
            <option value="email">email</option>
          </select>
          <select name="courseId" defaultValue="">
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <input name="subject" placeholder="Subject (email)" />
          <textarea
            className="md:col-span-2"
            name="body"
            placeholder="Body supports {{participant_first_name}}, {{class_date}}, {{class_time}}, {{class_location}}, {{instructor_name}}"
            rows={5}
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            Active template
          </label>
          <div>
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Template
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Template List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4">Body Preview</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-4">{template.name}</td>
                  <td className="py-2 pr-4 uppercase">{template.type}</td>
                  <td className="py-2 pr-4">{(template.courses as { name?: string } | null)?.name ?? "All"}</td>
                  <td className="py-2 pr-4">{template.active ? "yes" : "no"}</td>
                  <td className="py-2 pr-4 text-xs text-slate-600">{template.body.slice(0, 120)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
