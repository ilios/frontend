import { helper } from '@ember/component/helper';

export function filesize(params/*, hash*/) {
  let value = params[0];
  if (typeof value === 'undefined') {
    return null;
  }
  let i,
    rhett,
    units = ['b', 'kb', 'mb', 'gb', 'tb'];
  for (i = 0; i < units.length; i++) {
    if (value < 1024) {
      rhett = Math.floor(value) + units[i];
      break;
    }
    value = value / 1024;
  }
  return rhett;
}

export default helper(filesize);
