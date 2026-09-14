"use client";

import { useState } from "react";

export function PhotoField({
  name,
  label,
  catId,
  initialUrl,
  hint,
}: {
  name: string;
  label: string;
  catId?: string;
  initialUrl?: string | null;
  hint?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setStatus("올리는 중…");
    const body = new FormData();
    body.set("file", file);
    if (catId) body.set("catId", catId);
    const response = await fetch("/api/upload", { method: "POST", body });
    let data: { url?: string; error?: string } = {};
    try {
      data = (await response.json()) as { url?: string; error?: string };
    } catch {
      data = {};
    }
    setBusy(false);
    if (!response.ok || !data.url) {
      setStatus(data.error ?? "업로드에 실패했어요. 아래에서 URL을 직접 넣을 수 있어요.");
      return;
    }
    setUrl(data.url);
    setStatus("사진을 올렸어요.");
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold">{label}</label>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-28 w-28 rounded-2xl object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        disabled={busy}
        onChange={(event) => void onFile(event.target.files?.[0])}
        className="block w-full text-sm"
      />
      <input
        name={name}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="또는 사진 URL"
        className="field"
      />
      <p className="text-xs leading-5 text-ink-soft">
        {status || hint || "Vercel Blob이 없으면 URL만 저장돼요. 데이터베이스에는 주소만 남습니다."}
      </p>
    </div>
  );
}
