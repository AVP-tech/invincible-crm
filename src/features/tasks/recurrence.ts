import { TaskRecurrencePattern } from "@prisma/client";
import { addDays, addMonths, addWeeks } from "date-fns";

export function isRecurringPattern(pattern: TaskRecurrencePattern) {
  return pattern !== TaskRecurrencePattern.NONE;
}

export function formatTaskRecurrence(pattern: TaskRecurrencePattern, intervalDays?: number | null) {
  switch (pattern) {
    case TaskRecurrencePattern.DAILY:
      return "Repeats daily";
    case TaskRecurrencePattern.WEEKLY:
      return "Repeats weekly";
    case TaskRecurrencePattern.BIWEEKLY:
      return "Repeats every 2 weeks";
    case TaskRecurrencePattern.MONTHLY:
      return "Repeats monthly";
    case TaskRecurrencePattern.CUSTOM_DAYS:
      return intervalDays ? `Repeats every ${intervalDays} days` : "Repeats on a custom cadence";
    default:
      return null;
  }
}

export function getNextRecurringDueDate(date: Date, pattern: TaskRecurrencePattern, intervalDays?: number | null) {
  switch (pattern) {
    case TaskRecurrencePattern.DAILY:
      return addDays(date, 1);
    case TaskRecurrencePattern.WEEKLY:
      return addWeeks(date, 1);
    case TaskRecurrencePattern.BIWEEKLY:
      return addWeeks(date, 2);
    case TaskRecurrencePattern.MONTHLY:
      return addMonths(date, 1);
    case TaskRecurrencePattern.CUSTOM_DAYS:
      return addDays(date, intervalDays && intervalDays > 0 ? intervalDays : 7);
    default:
      return null;
  }
}
