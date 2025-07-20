export const isValidPositiveInteger = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const num = parseInt(value, 10);

  return !isNaN(num) && num > 0 && num.toString() === value.toString();
};

export const isValidStringIsoDate = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);

  return !isNaN(date.getTime()) && date.toISOString() === value;
};
