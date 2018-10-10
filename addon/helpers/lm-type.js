import { helper } from '@ember/component/helper';

export function lmType(params/*, hash*/) {
  const obj = params[0];
  if (obj.hasOwnProperty('filename')) {
    return 'file';
  }
  if (obj.hasOwnProperty('citation')) {
    return 'citation';
  }
  if (obj.hasOwnProperty('link')) {
    return 'link';
  }
}

export default helper(lmType);
