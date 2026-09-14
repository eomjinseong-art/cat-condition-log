"use client";

import { useMemo, useState } from "react";
import { composeDateKey, daysInMonth, parseDateParts, todayKey } from "@/lib/dates";

function yearOptions() {
  const current = Number(todayKey().slice(0, 4));
  const years: number[] = [];
  for (let year = current + 1; year >= current - 12; year -= 1) years.push(year);
  return years;
}

export function DateSelectField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const initial = parseDateParts(defaultValue);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const years = useMemo(() => yearOptions(), []);
  const dim = daysInMonth(year, month);
  const safeDay = Math.min(day, dim);
  const value = composeDateKey(year, month, safeDay);

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-bold">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="mt-1 grid grid-cols-3 gap-2">
        <label className="sr-only" htmlFor={`${name}-year`}>
          {label} 연도
        </label>
        <select
          id={`${name}-year`}
          className="field px-2"
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
        >
          {years.map((item) => (
            <option key={item} value={item}>
              {item}년
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${name}-month`}>
          {label} 월
        </label>
        <select
          id={`${name}-month`}
          className="field px-2"
          value={month}
          onChange={(event) => {
            const next = Number(event.target.value);
            setMonth(next);
            setDay((current) => Math.min(current, daysInMonth(year, next)));
          }}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
            <option key={item} value={item}>
              {item}월
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${name}-day`}>
          {label} 일
        </label>
        <select
          id={`${name}-day`}
          className="field px-2"
          value={safeDay}
          onChange={(event) => setDay(Number(event.target.value))}
        >
          {Array.from({ length: dim }, (_, index) => index + 1).map((item) => (
            <option key={item} value={item}>
              {item}일
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
