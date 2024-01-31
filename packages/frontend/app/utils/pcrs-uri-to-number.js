import { typeOf } from '@ember/utils';

export default function pcrsUriToNumber(uri) {
  if ('string' !== typeOf(uri)) {
    throw new TypeError(uri + ' is not a string.');
  }
  const pattern = /aamc-pcrs-comp-c(\d\d)(\d\d)/;
  if (pattern.test(uri)) {
    const match = uri.match(pattern);
    return '' + parseInt(match[1], 10) + '.' + parseInt(match[2], 10);
  }
  return uri;
}
