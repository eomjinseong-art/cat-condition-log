"use client";

import { useState, useTransition } from "react";
import { upsertLogAction } from "@/app/actions/logs";

export function LogPhoto({
  catId,
  loggedOn,
  field,
  initialUrl,
  label,
}: {
  catId: string;
  loggedOn: string;
  field: "photoUrl" | "vomitPhotoUrl";
  initialUrl?: string | null;
  label: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function upload(file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    body.set("catId", catId);
    const response = await fetch("/api/upload", { method: "POST", body });
    let data: { url?: string; error?: string } = {};
    try {
      data = (await response.json()) as { url?: string; error?: string };
    } catch {
      data = {};
    }
    if (!response.ok || !data.url) {
      setMessage(data.error ?? "업로드에 실패했어요.");
      return;
    }
    setUrl(data.url);
    startTransition(async () => {
      await upsertLogAction({ catId, loggedOn, [field]: data.url });
      setMessage("사진을 남겼어요.");
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-bold text-ink-soft">{label}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-24 w-24 rounded-2xl object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        disabled={pending}
        onChange={(event) => void upload(event.target.files?.[0])}
        className="block w-full text-sm"
      />
      {message ? <p className="text-xs text-ink-soft">{message}</p> : null}
    </div>
  );
}
