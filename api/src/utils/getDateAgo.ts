export const getDateAgoFromDays = (lastDays: number): Date => {
  if (lastDays <= 0) {
    throw new Error('Parameter "lastDays" must be a positive number');
  }

  const millisPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() - (lastDays * millisPerDay));

  return date;
};

export const getDateAgoFromWeeks = (lastWeeks: number): Date => {
  if (lastWeeks <= 0) {
    throw new Error('Parameter "lastWeeks" must be a positive number');
  }

  const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() - (lastWeeks * millisPerWeek));

  return date;
};

export const getDateAgoFromMonths = (lastMonths: number): Date => {
  if (lastMonths <= 0) {
    throw new Error('Parameter "lastMonths" must be a positive number');
  }

  const date = new Date();
  const originalDay = date.getDate();

  date.setMonth(date.getMonth() - lastMonths);

  // If the day overflows in the target month, set it to the last day of that month.
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  return date;
};

export const getDateAgoFromYears = (lastYears: number): Date => {
  if (lastYears <= 0) {
    throw new Error('Parameter "lastYears" must be a positive number');
  }

  const date = new Date();
  const originalDay = date.getDate();

  date.setFullYear(date.getFullYear() - lastYears);

  // If the day overflows in the target month, set it to the last day of that month.
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  return date;
};
