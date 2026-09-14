"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn-primary w-full" onClick={() => window.print()}>
      인쇄 / PDF 저장
    </button>
  );
}
