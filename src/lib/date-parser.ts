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

type TimeHint = {
  hour: number;
  matchedText: string;
  minute: number;
};

function applyResolvedTime(date: Date, hour = 9, minute = 0) {
  const candidate = new Date(date);
  candidate.setHours(hour, minute, 0, 0);
  return candidate;
}

function getTimeContext(input: string, matchIndex: number, matchLength: number) {
  const fromMatch = input.slice(matchIndex);
  const trailingContext = fromMatch.slice(matchLength);
  const punctuationIndex = trailingContext.search(/[.,;!\n]/);
  const contextEnd = punctuationIndex >= 0 ? matchLength + punctuationIndex : Math.min(fromMatch.length, matchLength + 32);

  return fromMatch.slice(0, contextEnd).trim();
}

function resolveTimeHint(context: string): TimeHint | null {
  // 12-hour format: 9:30 am, 4pm, etc.
  const explicitTimeMatch = context.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);

  if (explicitTimeMatch) {
    const rawHour = Number(explicitTimeMatch[1]);
    const minute = explicitTimeMatch[2] ? Number(explicitTimeMatch[2]) : 0;

    if (rawHour >= 1 && rawHour <= 12 && minute >= 0 && minute <= 59) {
      const meridiem = explicitTimeMatch[3];
      const hour = rawHour % 12 + (meridiem === "pm" ? 12 : 0);

      return {
        hour,
        matchedText: explicitTimeMatch[0],
        minute
      };
    }
  }

  // 24-hour format: 21:45, 14:30, at 09:00, etc.
  const time24Match = context.match(/\b(?:at\s+)?(\d{1,2}):(\d{2})\b/);

  if (time24Match) {
    const hour = Number(time24Match[1]);
    const minute = Number(time24Match[2]);

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return {
        hour,
        matchedText: time24Match[0],
        minute
      };
    }
  }

  if (/\bmorning\b/.test(context)) {
    return { hour: 8, matchedText: "morning", minute: 0 };
  }

  if (/\bafternoon\b/.test(context)) {
    return { hour: 12, matchedText: "afternoon", minute: 0 };
  }

  if (/\bevening\b/.test(context)) {
    return { hour: 16, matchedText: "evening", minute: 0 };
  }

  if (/\bnoon\b/.test(context)) {
    return { hour: 12, matchedText: "noon", minute: 0 };
  }

  return null;
}

function resolveMatchedDate(date: Date, input: string, matchIndex: number, matchedText: string): DateParseResult {
  const timeHint = resolveTimeHint(getTimeContext(input, matchIndex, matchedText.length));

  return {
    date: applyResolvedTime(date, timeHint?.hour ?? 9, timeHint?.minute ?? 0),
    matchedText: timeHint ? `${matchedText} ${timeHint.matchedText}` : matchedText
  };
}

function normalizeDateCandidate(baseDate: Date, year: number, month: number, day: number, hour = 9, minute = 0) {
  const candidate = new Date(baseDate);
  candidate.setHours(hour, minute, 0, 0);
  candidate.setFullYear(year, month, day);

  if (candidate.getMonth() !== month || candidate.getDate() !== day) {
    return null;
  }

  return candidate;
}

function resolveCalendarDate(baseDate: Date, day: number, month: number, year?: number, hour = 9, minute = 0) {
  const today = startOfDay(baseDate);
  const candidateYear = year ?? today.getFullYear();
  const initialCandidate = normalizeDateCandidate(today, candidateYear, month, day, hour, minute);

  if (!initialCandidate) {
    return null;
  }

  if (year) {
    return initialCandidate;
  }

  if (initialCandidate >= today) {
    return initialCandidate;
  }

  return normalizeDateCandidate(today, candidateYear + 1, month, day, hour, minute);
}

export function resolveRelativeDate(input: string, baseDate = new Date()): DateParseResult {
  const normalized = input.toLowerCase();
  const today = startOfDay(baseDate);

  const todayMatch = normalized.match(/\btoday\b/);

  if (todayMatch?.index !== undefined) {
    return resolveMatchedDate(today, normalized, todayMatch.index, todayMatch[0]);
  }

  const dayAfterTomorrowMatch = normalized.match(/\bday after tomorrow\b/);

  if (dayAfterTomorrowMatch?.index !== undefined) {
    return resolveMatchedDate(addDays(today, 2), normalized, dayAfterTomorrowMatch.index, dayAfterTomorrowMatch[0]);
  }

  const tomorrowMatch = normalized.match(/\btomorrow\b/);

  if (tomorrowMatch?.index !== undefined) {
    return resolveMatchedDate(addDays(today, 1), normalized, tomorrowMatch.index, tomorrowMatch[0]);
  }

  const inDaysMatch = normalized.match(/\bin (\d+)\s+days?\b/);

  if (inDaysMatch?.index !== undefined) {
    const amount = Number(inDaysMatch[1]);
    return resolveMatchedDate(addDays(today, amount), normalized, inDaysMatch.index, inDaysMatch[0]);
  }

  const nextWeekdayMatch = normalized.match(/\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);

  if (nextWeekdayMatch?.index !== undefined) {
    const day = weekdayMap[nextWeekdayMatch[1]];
    return resolveMatchedDate(nextDay(addDays(today, 6), day as 0 | 1 | 2 | 3 | 4 | 5 | 6), normalized, nextWeekdayMatch.index, nextWeekdayMatch[0]);
  }

  const weekdayMatch = normalized.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);

  if (weekdayMatch?.index !== undefined) {
    const day = weekdayMap[weekdayMatch[1]];
    return resolveMatchedDate(nextDay(today, day as 0 | 1 | 2 | 3 | 4 | 5 | 6), normalized, weekdayMatch.index, weekdayMatch[0]);
  }

  // Global date format: DD-MM-YY or DD/MM/YYYY (day first, then month)
  const numericDateMatch = normalized.match(/\b(?:on|by)?\s*(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

  if (numericDateMatch?.index !== undefined) {
    const first = Number(numericDateMatch[1]);
    const second = Number(numericDateMatch[2]);
    // Global format: DD-MM-YY. If first number > 12, it must be a day.
    // If second number > 12, it must be a day (American format).
    // Default to DD-MM (Global) when ambiguous.
    let day: number;
    let month: number;
    if (first > 12 && second <= 12) {
      day = first;
      month = second - 1;
    } else if (second > 12 && first <= 12) {
      day = second;
      month = first - 1;
    } else {
      // Ambiguous: default to Global DD-MM
      day = first;
      month = second - 1;
    }
    const rawYear = numericDateMatch[3] ? Number(numericDateMatch[3]) : undefined;
    const year = rawYear ? (rawYear < 100 ? 2000 + rawYear : rawYear) : undefined;
    const timeHint = resolveTimeHint(getTimeContext(normalized, numericDateMatch.index, numericDateMatch[0].length));
    const date = resolveCalendarDate(today, day, month, year, timeHint?.hour ?? 9, timeHint?.minute ?? 0);

    if (date) {
      return {
        date,
        matchedText: timeHint ? `${numericDateMatch[0]} ${timeHint.matchedText}` : numericDateMatch[0]
      };
    }
  }

  const dayMonthMatch = normalized.match(
    /\b(?:on|by)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?\b/
  );

  if (dayMonthMatch?.index !== undefined) {
    const day = Number(dayMonthMatch[1]);
    const month = monthMap[dayMonthMatch[2]];
    const year = dayMonthMatch[3] ? Number(dayMonthMatch[3]) : undefined;
    const timeHint = resolveTimeHint(getTimeContext(normalized, dayMonthMatch.index, dayMonthMatch[0].length));
    const date = resolveCalendarDate(today, day, month, year, timeHint?.hour ?? 9, timeHint?.minute ?? 0);

    if (date) {
      return {
        date,
        matchedText: timeHint ? `${dayMonthMatch[0]} ${timeHint.matchedText}` : dayMonthMatch[0]
      };
    }
  }

  const monthDayMatch = normalized.match(
    /\b(?:on|by)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/
  );

  if (monthDayMatch?.index !== undefined) {
    const month = monthMap[monthDayMatch[1]];
    const day = Number(monthDayMatch[2]);
    const year = monthDayMatch[3] ? Number(monthDayMatch[3]) : undefined;
    const timeHint = resolveTimeHint(getTimeContext(normalized, monthDayMatch.index, monthDayMatch[0].length));
    const date = resolveCalendarDate(today, day, month, year, timeHint?.hour ?? 9, timeHint?.minute ?? 0);

    if (date) {
      return {
        date,
        matchedText: timeHint ? `${monthDayMatch[0]} ${timeHint.matchedText}` : monthDayMatch[0]
      };
    }
  }

  return { date: null, matchedText: null };
}
