import { format } from "date-fns";

interface RenderTemplateInput {
  body: string;
  subject?: string | null;
  participantFirstName: string;
  classDate: string | null;
  classTime: string | null;
  classLocation: string;
  instructorName: string | null;
}

function applyVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{{${key}}}`, value);
  }, template);
}

export function renderTemplate(input: RenderTemplateInput) {
  const formattedDate = input.classDate ? format(new Date(input.classDate), "PPP") : "TBD";
  const vars = {
    participant_first_name: input.participantFirstName,
    class_date: formattedDate,
    class_time: input.classTime ?? "TBD",
    class_location: input.classLocation,
    instructor_name: input.instructorName ?? "Instructor"
  };

  return {
    renderedSubject: input.subject ? applyVars(input.subject, vars) : null,
    renderedBody: applyVars(input.body, vars)
  };
}
