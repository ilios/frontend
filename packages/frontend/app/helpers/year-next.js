import ENV from 'frontend/config/environment';

export default function yearNext(year) {
  const yearNext = (parseInt(year) + 1).toString();

  return ENV.environment != 'production' ? yearNext.substring(-2) : yearNext;
}
