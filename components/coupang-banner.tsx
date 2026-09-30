const COUPANG_PARTNERS_URL = "https://link.coupang.com/a/hsdzLh1vB6";

/** 하단 쿠팡 파트너스 배너 (광고). 링크는 수익 추적용이므로 수정하지 마세요. */
export function CoupangBanner({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="광고" className={`mt-4 ${className}`}>
      <a
        href={COUPANG_PARTNERS_URL}
        target="_blank"
        rel="sponsored noopener noreferrer nofollow"
        className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-paper-strong px-3.5 py-2.5 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent"
      >
        <span className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">
          광고
        </span>
        <span className="min-w-0 flex-1">기록은 여기서, 주인님 조공 준비는 쿠팡에서</span>
        <span aria-hidden="true" className="shrink-0 text-accent">
          →
        </span>
      </a>
      <p className="mt-2 text-[11px] leading-5 text-ink-soft">
        이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </aside>
  );
}
