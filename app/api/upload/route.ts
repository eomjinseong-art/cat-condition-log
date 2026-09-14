import { blobConfigured, uploadPhoto } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireOwnedCat } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const userId = user.id;
  if (!blobConfigured()) {
    return Response.json(
      {
        error:
          "사진 업로드는 Vercel Blob 토큰이 필요해요. BLOB_READ_WRITE_TOKEN을 설정하거나 사진 URL을 직접 넣어 주세요.",
        fallback: "url",
      },
      { status: 501 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const catId = typeof form.get("catId") === "string" ? String(form.get("catId")) : null;
  const logId = typeof form.get("logId") === "string" ? String(form.get("logId")) : null;
  const kind = typeof form.get("kind") === "string" ? String(form.get("kind")) : "photo";

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "사진 파일을 선택해 주세요." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "사진은 8MB 이하로 올려 주세요." }, { status: 400 });
  }
  if (catId) {
    await requireOwnedCat(userId, catId);
  }

  const uploaded = await uploadPhoto(file, userId);
  const media = await prisma.media.create({
    data: {
      userId,
      catId,
      logId,
      url: uploaded.url,
      filename: uploaded.filename,
      kind,
    },
  });

  return Response.json({ url: media.url, id: media.id });
}
