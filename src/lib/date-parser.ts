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

const monthMap: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

type DateParseResult = {
  date: Date | null;
  matchedText: string | null;
};

function normalizeDateCandidate(baseDate: Date, year: number, month: number, day: number) {
  const candidate = new Date(baseDate);
  candidate.setHours(9, 0, 0, 0);
  candidate.setFullYear(year, month, day);

  if (candidate.getMonth() !== month || candidate.getDate() !== day) {
    return null;
  }

  return candidate;
}

function resolveCalendarDate(baseDate: Date, day: number, month: number, year?: number) {
  const today = startOfDay(baseDate);
  const candidateYear = year ?? today.getFullYear();
  const initialCandidate = normalizeDateCandidate(today, candidateYear, month, day);

  if (!initialCandidate) {
    return null;
  }

  if (year) {
    return initialCandidate;
  }

  if (initialCandidate >= today) {
    return initialCandidate;
  }

  return normalizeDateCandidate(today, candidateYear + 1, month, day);
}

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

  const numericDateMatch = normalized.match(/\b(?:on|by)?\s*(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

  if (numericDateMatch) {
    const day = Number(numericDateMatch[1]);
    const month = Number(numericDateMatch[2]) - 1;
    const rawYear = numericDateMatch[3] ? Number(numericDateMatch[3]) : undefined;
    const year = rawYear ? (rawYear < 100 ? 2000 + rawYear : rawYear) : undefined;
    const date = resolveCalendarDate(today, day, month, year);

    if (date) {
      return {
        date,
        matchedText: numericDateMatch[0]
      };
    }
  }

  const dayMonthMatch = normalized.match(
    /\b(?:on|by)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?\b/
  );

  if (dayMonthMatch) {
    const day = Number(dayMonthMatch[1]);
    const month = monthMap[dayMonthMatch[2]];
    const year = dayMonthMatch[3] ? Number(dayMonthMatch[3]) : undefined;
    const date = resolveCalendarDate(today, day, month, year);

    if (date) {
      return {
        date,
        matchedText: dayMonthMatch[0]
      };
    }
  }

  const monthDayMatch = normalized.match(
    /\b(?:on|by)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/
  );

  if (monthDayMatch) {
    const month = monthMap[monthDayMatch[1]];
    const day = Number(monthDayMatch[2]);
    const year = monthDayMatch[3] ? Number(monthDayMatch[3]) : undefined;
    const date = resolveCalendarDate(today, day, month, year);

    if (date) {
      return {
        date,
        matchedText: monthDayMatch[0]
      };
    }
  }

  return { date: null, matchedText: null };
}
