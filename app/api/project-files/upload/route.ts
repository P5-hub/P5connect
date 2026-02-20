import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "project-documents";

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ParsedProjectId =
  | { ok: true; value: string | number; valueStr: string; kind: "uuid" | "number" }
  | { ok: false; error: string };

function parseProjectId(raw: FormDataEntryValue | null): ParsedProjectId {
  const s = typeof raw === "string" ? raw.trim() : "";

  if (!s || s === "undefined" || s === "null") {
    return {
      ok: false,
      error: `Missing project_id (received: "${String(raw)}")`,
    };
  }

  // ✅ UUID accepted
  if (UUID_RE.test(s)) {
    return { ok: true, value: s, valueStr: s, kind: "uuid" };
  }

  // ✅ numeric accepted (also tolerates "77,8" / "77.8" -> 77)
  const normalized = s.replace(",", ".");
  const n = Number(normalized);

  if (!Number.isFinite(n)) {
    return { ok: false, error: `Invalid project_id (received: "${s}")` };
  }

  const id = Math.trunc(n);
  if (id <= 0) {
    return { ok: false, error: `Invalid project_id (must be > 0, received: "${s}")` };
  }

  return { ok: true, value: id, valueStr: String(id), kind: "number" };
}

function parseOptionalNumber(raw: FormDataEntryValue | null) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s || s === "undefined" || s === "null") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalString(raw: FormDataEntryValue | null) {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s || s === "undefined" || s === "null") return null;
  return s;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const projectIdRaw = formData.get("project_id");
    const dealerIdRaw = formData.get("dealer_id");
    const loginNrRaw = formData.get("login_nr");

    console.log("UPLOAD formData keys:", Array.from(formData.keys()));
    console.log("UPLOAD project_id raw:", projectIdRaw, "dealer_id raw:", dealerIdRaw);

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: `Missing file (received: "${String(file)}")` },
        { status: 400 }
      );
    }

    const parsedProject = parseProjectId(projectIdRaw);
    if (!parsedProject.ok) {
      return NextResponse.json({ error: parsedProject.error }, { status: 400 });
    }

    const dealer_id_num = parseOptionalNumber(dealerIdRaw);
    const login_nr = parseOptionalString(loginNrRaw);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = sanitizeFilename(file.name);
    const dealerSegment =
      dealer_id_num !== null ? `/dealer_${String(dealer_id_num)}` : "";

    // ✅ use string version for folders (works for uuid and numbers)
    const path = `projects/${parsedProject.valueStr}${dealerSegment}/${Date.now()}-${safeName}`;

    // 1) Upload in Storage
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}`, path },
        { status: 400 }
      );
    }

    // 2) DB Insert
    // ✅ project_id goes in as number OR uuid string (depending on what arrived)
    const { error: dbError } = await supabase.from("project_files").insert({
      project_id: parsedProject.value,
      file_name: file.name,
      dealer_id: dealer_id_num,
      login_nr,
      bucket: BUCKET,
      path,
      file_size: file.size,
      mime_type: file.type || null,
    });

    if (dbError) {
      await supabase.storage.from(BUCKET).remove([path]);
      return NextResponse.json(
        {
          error: `DB insert failed: ${dbError.message}`,
          hint:
            "Falls project_files.project_id ein INTEGER ist, musst du im Frontend eine Zahl senden (nicht UUID). Falls es UUID ist, passt es so.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      project_id: parsedProject.value,
      project_id_kind: parsedProject.kind,
      path,
    });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
