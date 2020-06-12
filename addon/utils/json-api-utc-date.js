import moment from 'moment';

export function jsonApiUtcSerializeDate(obj, property) {
  obj.data.attributes[property] = moment.utc(obj.data.attributes[property]).local().format('YYYY-MM-DD');
}

export function jsonApiUtcNormalizeDate(resourceHash, property) {
  const date = moment.utc(resourceHash.attributes[property]).format('YYYY-MM-DD');
  const localDate = moment(date, 'YYYY-MM-DD');
  resourceHash.attributes[property] = localDate.format();
}
