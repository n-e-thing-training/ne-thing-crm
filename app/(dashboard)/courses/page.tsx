import { SectionHeader } from "@/components/section-header";
import { createCourseAction, listCourses } from "@/lib/actions/courses";

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <div className="space-y-6">
      <SectionHeader title="Courses" description="Training course catalog." />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Create Course</h3>
        <form action={createCourseAction} className="grid gap-3 md:grid-cols-3">
          <input name="name" placeholder="Course name" required />
          <input name="code" placeholder="Code" />
          <input name="durationMinutes" type="number" min={1} placeholder="Duration minutes" />
          <div className="md:col-span-3">
            <button className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Save Course
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Course List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{course.name}</td>
                  <td className="py-2 pr-4">{course.code ?? "-"}</td>
                  <td className="py-2 pr-4">{course.duration_minutes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
