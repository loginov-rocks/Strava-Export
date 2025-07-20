import { getDateAgoFromDays } from './getDateAgo';

/**
 * Validates that a value is a string containing a valid date that falls within the last specified number of days from
 * now. Future dates are considered valid and will return true. Returns false for non-strings, invalid dates, or dates
 * older than the specified range.
 */
export const isValidDateStringFromLastDays = (value: unknown, lastDays: number): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return false;
  }

  const dateAgoFromDays = getDateAgoFromDays(lastDays);

  return date >= dateAgoFromDays;
};

export const isValidIsoDateString = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return !isNaN(date.getTime()) && date.toISOString() === value;
};

export const isValidNonEmptyString = (value: unknown): boolean => (
  typeof value === 'string' && value.trim() !== ''
);

export const isValidNonZeroNumber = (value: unknown): boolean => (
  typeof value === 'number' && !isNaN(value) && value !== 0
);

export const isValidPositiveIntegerString = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const num = parseInt(value, 10);

  return !isNaN(num) && num > 0 && num.toString() === value.toString();
};
