import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { serverError } from "@/lib/api";

const MAX_FILES = 5;
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Accepts up to 5 images (multipart field "files") and stores them under
 * public/uploads. Used by the sell flow and the admin inventory form.
 * Note: local-disk storage is demo-grade — swap for object storage in production.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `At most ${MAX_FILES} images allowed` }, { status: 400 });
    }

    for (const file of files) {
      if (!EXTENSIONS[file.type]) {
        return NextResponse.json(
          { error: "Only JPEG, PNG and WebP images are accepted" },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Images must be 4 MB or smaller" }, { status: 400 });
      }
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const paths: string[] = [];
    for (const file of files) {
      const filename = `${crypto.randomUUID()}${EXTENSIONS[file.type]}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      paths.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ paths }, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to upload images");
  }
}
