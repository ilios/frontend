import { DateTime } from 'luxon';

export default function currentAcademicYear() {
  const today = DateTime.now();
  const { month, year } = today;
  if (month < 4) {
    return year - 1;
  }

  return year;
}
