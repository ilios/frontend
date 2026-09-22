import { helper } from '@ember/component/helper';
import { isHTMLSafe, htmlSafe as _htmlSafe } from '@ember/template';

export function htmlSafe([string]) {
  if (isHTMLSafe(string)) {
    string = string.toString();
  }

  string = string || '';

  return _htmlSafe(string);
}

export default helper(htmlSafe);
