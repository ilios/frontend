import { DateTime } from 'luxon';

/*
 * Some dates in our API are weird!
 * We send them to the server as YYYY-MM-DD, but we get them back
 * as fully formed ISO dates. However, and this is where it gets interesting
 * the ISO date isn't real. What happens is we take whatever the date is and,
 * on the server, we assume it's UTC. It isn't though, it's just a date.
 */

const isoRegex = /(\d{4})-(\d{2})-(\d{2})/;

/**
 * Take the date that ember-data sends as an ISO time and parse it with luxon.
 * This allows us to extract the year-month-day as a local time. Ember data's iso time includes
 * a time stamp, if we don't put this back into local time we'll be sending the wrong date
 * when UTC is a different date then local time.
 */
export function jsonApiUtcSerializeDate(obj, property) {
  const { year, month, day } = DateTime.fromISO(obj.data.attributes[property]);
  const paddedMonth = `${month}`.padStart(2, '0');
  const paddedDay = `${day}`.padStart(2, '0');
  obj.data.attributes[property] = `${year}-${paddedMonth}-${paddedDay}`;
}

/**
 * Normalizing the UTC ISO date from the server, pulling out the year/month/day because
 * it isn't a real ISO date and isn't really in UTC and then converting that
 * into an ISO time stamp that ember-data expects in the users local time.
 *
 * This then displayes to the user as year/month/day in their local time and when they change
 * it we can do the same dance for serialization in reverse.
 */
export function jsonApiUtcNormalizeDate(resourceHash, property) {
  const match = isoRegex.exec(resourceHash.attributes[property]);
  if (match) {
    const [, year, month, day] = match;
    resourceHash.attributes[property] = DateTime.fromObject({ year, month, day }).toISO();
  }
}
