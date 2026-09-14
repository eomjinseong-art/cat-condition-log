import { RelatedResources } from "@/components/partner-links";
import { DISCLAIMER } from "@/lib/constants";
import { displayDate } from "@/lib/dates";
import { reminderLabels } from "@/lib/labels";
import type { BuiltReport } from "@/lib/report";

export function ReportDocument({ report }: { report: BuiltReport }) {
  return (
    <article className="space-y-5 print:space-y-4">
      <header className="card p-5">
        <p className="text-xs font-bold tracking-wide text-accent">병원 제출용 정리</p>
        <h1 className="mt-1 text-2xl font-extrabold">{report.catName} 컨디션 기록</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {displayDate(report.from)} – {displayDate(report.to)}
        </p>
        <p className="mt-3 rounded-2xl bg-[#f6ead6] px-3 py-2 text-xs leading-6">{DISCLAIMER}</p>
      </header>

      <section className="card p-5">
        <h2 className="text-sm font-bold text-ink-soft">신원</h2>
        <ul className="mt-3 space-y-1 text-sm leading-7">
          {report.identity.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-bold text-ink-soft">기간 요약 (입력값 그대로)</h2>
        <ul className="mt-3 space-y-1 text-sm leading-7">
          {report.trends.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-bold text-ink-soft">약 · 일정</h2>
        {report.meds.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">이 기간에 등록된 일정이 없어요.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {report.meds.map((item) => (
              <li key={`${item.title}-${item.dueOn}`}>
                {displayDate(item.dueOn)} · {reminderLabels[item.type]} · {item.title}
                {item.completed ? " · 완료" : " · 미완료"}
                {item.notes ? ` · ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-bold text-ink-soft">일별 타임라인</h2>
        {report.timeline.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">선택한 기간에 기록이 없어요.</p>
        ) : (
          <ol className="mt-3 space-y-4">
            {report.timeline.map((day) => (
              <li key={day.date} className="border-b border-line pb-3 last:border-0">
                <p className="font-bold">{displayDate(day.date)}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  {day.rows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-ink-soft">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="px-1 pt-1">
        <RelatedResources context="report" />
      </footer>
    </article>
  );
}
