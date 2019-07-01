import { helper } from '@ember/component/helper';

export function lmType(params/*, hash*/) {
  const obj = params[0];
  if (Object.prototype.hasOwnProperty.call(obj, 'filename')) {
    return 'file';
  }
  if (Object.prototype.hasOwnProperty.call(obj, 'citation')) {
    return 'citation';
  }
  if (Object.prototype.hasOwnProperty.call(obj, 'link')) {
    return 'link';
  }
}

export default helper(lmType);
