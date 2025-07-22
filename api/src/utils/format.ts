export const formatIsoDateStringToLocaleString = (isoDate: string): string => (
  new Date(isoDate).toLocaleString()
);

/**
 * Formats a local date string by replacing the incorrect UTC marker ('Z') with the proper timezone offset.
 */
export const formatLocalDateStringWithTimezone = (localDate: string, utcOffsetSeconds: number): string => {
  const offsetHours = Math.floor(Math.abs(utcOffsetSeconds) / 3600);
  const offsetMins = Math.floor((Math.abs(utcOffsetSeconds) % 3600) / 60);
  const sign = utcOffsetSeconds >= 0 ? '+' : '-';
  const offsetString = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

  return localDate.replace('Z', offsetString);
};

export const formatNumberToTwoDecimals = (value: number): number => (
  Number(value.toFixed(2))
);
