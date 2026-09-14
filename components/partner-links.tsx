import type { ReactNode } from "react";
import { DISCLAIMER } from "@/lib/constants";
import { partners } from "@/lib/partners";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-line underline-offset-2 hover:text-ink"
    >
      {children}
    </a>
  );
}

function KindLabel({ children }: { children: string }) {
  return (
    <span className="mr-1.5 text-[10px] font-semibold tracking-wider text-ink-soft/80">{children}</span>
  );
}

export function PartnerLinks({
  variant = "footer",
}: {
  variant?: "footer" | "settings";
}) {
  const heading = variant === "settings" ? "케어 가이드" : "함께하는 곳";

  return (
    <aside className="text-[12px] leading-6 text-ink-soft">
      <p className="font-semibold tracking-wide text-ink-soft">{heading}</p>
      <p className="mt-1">
        참고·협력 링크예요. 이 기록 앱과는 별도 사이트입니다.
      </p>
      <p className="mt-3">
        <KindLabel>{partners.wiki.kind}</KindLabel>
        <ExternalLink href={partners.wiki.href}>{partners.wiki.name}</ExternalLink>
        <span> — {partners.wiki.blurb}</span>
      </p>
      <p className="mt-1.5">
        <KindLabel>{partners.shop.kind}</KindLabel>
        <ExternalLink href={partners.shop.href}>{partners.shop.name}</ExternalLink>
        <span> — {partners.shop.blurb}</span>
      </p>
    </aside>
  );
}

export function RelatedResources({
  context,
}: {
  context: "vomit" | "food" | "empty" | "report";
}) {
  if (context === "vomit") {
    return (
      <p className="mt-3 text-[12px] leading-6 text-ink-soft">
        기록은 여기 남겨 두었어요. 일반적인 돌봄 설명이 필요하면{" "}
        <ExternalLink href={partners.wiki.href}>{partners.wiki.name}</ExternalLink>를 참고해 보세요.{" "}
        {DISCLAIMER}
      </p>
    );
  }

  if (context === "food") {
    return (
      <p className="mt-3 text-[12px] leading-6 text-ink-soft">
        식사 기록을 남기셨어요. 사료 설명이 궁금하면{" "}
        <ExternalLink href={partners.wiki.href}>{partners.wiki.name}</ExternalLink>
        를, 물건 목록이 필요하면{" "}
        <ExternalLink href={partners.shop.href}>{partners.shop.name}</ExternalLink>를 천천히 살펴봐도
        좋아요.
      </p>
    );
  }

  if (context === "empty") {
    return (
      <p className="mt-4 text-center text-[12px] leading-6 text-ink-soft">
        이런 상황의 일반 가이드를 보고 싶다면{" "}
        <ExternalLink href={partners.wiki.href}>{partners.wiki.name}</ExternalLink>를 열어 보세요.
      </p>
    );
  }

  return (
    <p className="text-[11px] leading-6 text-ink-soft">
      일반 돌봄 교육 자료(참고):{" "}
      <ExternalLink href={partners.wiki.href}>{partners.wiki.name}</ExternalLink>. {DISCLAIMER}
    </p>
  );
}
