import $ from 'jquery';

const { trim } = $;

export function cleanQuery(query) {
  return trim(query).replace(/[-,?~!@#$%&*+'="]/, ' ');
}
