import { helper } from '@ember/component/helper';
import { capitalize as _capitalize } from '@ember/string';
import { isHTMLSafe } from '@ember/template';

export function capitalize([string]) {
  if (isHTMLSafe(string)) {
    string = string.toString();
  }

  string = string || '';

  return _capitalize(string);
}

export default helper(capitalize);
