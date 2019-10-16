import { helper } from '@ember/component/helper';
import striptags from 'striptags';

export function removeHtmlTags(params) {
  if (!(params[0] === undefined)) {
    return striptags(params[0]);
  }
}

export default helper(removeHtmlTags);
