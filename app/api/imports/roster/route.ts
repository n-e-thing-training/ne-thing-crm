import { NextResponse } from "next/server";
import { importRosterAction } from "@/lib/actions/imports";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await importRosterAction(formData);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
