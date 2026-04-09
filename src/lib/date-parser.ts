import { addDays, nextDay, startOfDay } from "date-fns";

const weekdayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

type DateParseResult = {
  date: Date | null;
  matchedText: string | null;
};

export function resolveRelativeDate(input: string, baseDate = new Date()): DateParseResult {
  const normalized = input.toLowerCase();
  const today = startOfDay(baseDate);

  if (normalized.includes("today")) {
    return { date: today, matchedText: "today" };
  }

  if (normalized.includes("day after tomorrow")) {
    return { date: addDays(today, 2), matchedText: "day after tomorrow" };
  }

  if (normalized.includes("tomorrow")) {
    return { date: addDays(today, 1), matchedText: "tomorrow" };
  }

  const inDaysMatch = normalized.match(/\bin (\d+)\s+days?\b/);

  if (inDaysMatch) {
    const amount = Number(inDaysMatch[1]);

    return {
      date: addDays(today, amount),
      matchedText: inDaysMatch[0]
    };
  }

  const nextWeekdayMatch = normalized.match(/\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);

  if (nextWeekdayMatch) {
    const day = weekdayMap[nextWeekdayMatch[1]];

    return {
      date: nextDay(addDays(today, 6), day as 0 | 1 | 2 | 3 | 4 | 5 | 6),
      matchedText: nextWeekdayMatch[0]
    };
  }

  const weekdayMatch = normalized.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);

  if (weekdayMatch) {
    const day = weekdayMap[weekdayMatch[1]];

    return {
      date: nextDay(today, day as 0 | 1 | 2 | 3 | 4 | 5 | 6),
      matchedText: weekdayMatch[0]
    };
  }

  return { date: null, matchedText: null };
}
