import { helper } from '@ember/component/helper';
import { htmlSafe as _htmlSafe,isHTMLSafe } from '@ember/template';

export function htmlSafe([string]) {
  if (isHTMLSafe(string)) {
    string = string.toString();
  }

  string = string || '';

  return _htmlSafe(string);
}

export default helper(htmlSafe);
