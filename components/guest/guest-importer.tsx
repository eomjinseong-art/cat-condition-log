"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { forgetGuestMemory, peekGuestSnapshot } from "@/components/guest/guest-runtime";
import { guestSnapshotHasData, loadGuestSnapshot } from "@/lib/guest-store";

let importStarted = false;

export function GuestImporter() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");

  useEffect(() => {
    if (importStarted) return;
    const snapshot = loadGuestSnapshot();
    const payload = guestSnapshotHasData(snapshot) ? snapshot : peekGuestSnapshot();
    if (!guestSnapshotHasData(payload)) return;

    importStarted = true;
    setStatus("importing");
    void fetch("/api/guest/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("import failed");
        forgetGuestMemory();
        setStatus("done");
        router.refresh();
      })
      .catch(() => {
        importStarted = false;
        setStatus("error");
      });
  }, [router]);

  if (status === "idle") return null;

  return (
    <p
      className={`mb-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
        status === "error" ? "bg-[#f6d6d6] text-ink-soft" : "bg-[#f6ead6] text-ink-soft"
      }`}
      role="status"
    >
      {status === "importing"
        ? "이 기기에 남긴 기록을 계정으로 옮기는 중이에요…"
        : status === "done"
          ? "이 기기에 있던 기록을 계정으로 옮겼어요."
          : "기록을 바로 옮기지 못했어요. 페이지를 새로고침하면 다시 시도해요. 이 기기 데이터는 그대로 있어요."}
    </p>
  );
}
