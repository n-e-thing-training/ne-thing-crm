"use server";

import { revalidatePath } from "next/cache";
import { parseRosterFile } from "@/lib/imports/parse-roster";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/actions/audit";

export async function listImports() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("imports")
    .select("id, file_name, file_type, total_rows, created_participants, created_registrations, duplicate_rows, error_rows, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listImportClassOptions() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, class_date, city, state")
    .order("class_date", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function importRosterAction(formData: FormData) {
  const classId = String(formData.get("classId") ?? "");
  const file = formData.get("file");

  if (!classId) throw new Error("classId is required");
  if (!file || !(file instanceof File)) throw new Error("file is required");

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const parsed = await parseRosterFile(file);
  const existingParticipantsRes = await supabase
    .from("participants")
    .select("id, first_name, last_name, email")
    .limit(10000);

  if (existingParticipantsRes.error) throw new Error(existingParticipantsRes.error.message);

  const existingParticipants = existingParticipantsRes.data ?? [];

  const duplicateReport: Array<{ rowNumber: number; reason: string }> = [];
  const insertedParticipantIds: string[] = [];
  let createdRegistrations = 0;

  for (const row of parsed.rows) {
    const existing = existingParticipants.find(
      (participant) =>
        participant.first_name.toLowerCase() === row.firstName.toLowerCase() &&
        participant.last_name.toLowerCase() === row.lastName.toLowerCase() &&
        (participant.email || "").toLowerCase() === (row.email || "").toLowerCase()
    );

    let participantId = existing?.id;

    if (!participantId) {
      const insertParticipant = await supabase
        .from("participants")
        .insert({
          first_name: row.firstName,
          last_name: row.lastName,
          email: row.email,
          phone: row.phone
        })
        .select("id")
        .single();

      if (insertParticipant.error) {
        parsed.rowErrors.push({ rowNumber: row.rowNumber, error: insertParticipant.error.message });
        continue;
      }

      participantId = insertParticipant.data.id;
      insertedParticipantIds.push(participantId);
      existingParticipants.push({
        id: participantId,
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email
      });
    } else {
      duplicateReport.push({ rowNumber: row.rowNumber, reason: "Participant already exists; linked to existing record" });
    }

    const insertRegistration = await supabase.from("registrations").insert({
      class_id: classId,
      participant_id: participantId
    });

    if (insertRegistration.error) {
      if (insertRegistration.error.code === "23505") {
        duplicateReport.push({ rowNumber: row.rowNumber, reason: "Registration already exists for this class" });
      } else {
        parsed.rowErrors.push({ rowNumber: row.rowNumber, error: insertRegistration.error.message });
      }
      continue;
    }

    createdRegistrations += 1;
  }

  const importInsert = await supabase
    .from("imports")
    .insert({
      class_id: classId,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      total_rows: parsed.rows.length,
      created_participants: insertedParticipantIds.length,
      created_registrations: createdRegistrations,
      duplicate_rows: duplicateReport.length,
      error_rows: parsed.rowErrors.length,
      row_errors: parsed.rowErrors,
      duplicate_report: duplicateReport,
      imported_by: userData.user?.id
    })
    .select("id")
    .single();

  if (importInsert.error) throw new Error(importInsert.error.message);

  await writeAuditLog({
    actorId: userData.user?.id,
    actorEmail: userData.user?.email,
    entityType: "import",
    entityId: importInsert.data.id,
    action: "roster_import",
    changeSet: {
      classId,
      fileName: file.name,
      totalRows: parsed.rows.length,
      createdParticipants: insertedParticipantIds.length,
      createdRegistrations,
      duplicateRows: duplicateReport.length,
      errorRows: parsed.rowErrors.length
    }
  });

  revalidatePath("/imports");
  revalidatePath("/participants");
  revalidatePath("/registrations");
  revalidatePath("/dashboard");
}
