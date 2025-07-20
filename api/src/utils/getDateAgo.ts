export const getDateAgoFromDays = (lastDays: number): Date => {
  const millisPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() - (lastDays * millisPerDay));

  return date;
};

export const getDateAgoFromWeeks = (lastWeeks: number): Date => {
  const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() - (lastWeeks * millisPerWeek));

  return date;
};

export const getDateAgoFromMonths = (lastMonths: number): Date => {
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
  const date = new Date();
  const originalDay = date.getDate();

  date.setFullYear(date.getFullYear() - lastYears);

  // If the day overflows in the target month, set it to the last day of that month.
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  return date;
};
