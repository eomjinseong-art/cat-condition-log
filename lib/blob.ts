import { del, put } from "@vercel/blob";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPhoto(file: File, userId: string) {
  if (!blobConfigured()) {
    throw new Error("BLOB_UNAVAILABLE");
  }
  const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `cat-condition/${userId}/${Date.now()}-${safeName}`;
  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return { url: blob.url, filename: file.name };
}

export async function deletePhoto(url: string) {
  if (!blobConfigured() || !url.includes("blob.vercel-storage.com")) return;
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // 계정 삭제 경로에서 스토리지 실패가 DB 정리를 막지 않게 합니다.
  }
}
