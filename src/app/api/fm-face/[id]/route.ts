import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const facesDir =
  process.env.FM_FACES_DIR ||
  "C:\\Users\\jdieg\\Documents\\Sports Interactive\\Football Manager 26\\graphics\\faces\\faces";
const publicFacesDir = join(process.cwd(), "public", "faces");
const facesBaseUrl =
  process.env.FM_FACES_BASE_URL ||
  "https://huggingface.co/datasets/soldadodecoco/fm26-facess/resolve/main";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return new NextResponse("Invalid face id", { status: 400 });
  }

  try {
    const image = await readFile(join(publicFacesDir, `${id}.png`)).catch(() => readFile(join(facesDir, `${id}.png`)));
    return new NextResponse(image, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    if (facesBaseUrl) {
      return NextResponse.redirect(`${facesBaseUrl.replace(/\/$/, "")}/${id}.png`, 302);
    }
    return new NextResponse("Face not found", { status: 404 });
  }
}
