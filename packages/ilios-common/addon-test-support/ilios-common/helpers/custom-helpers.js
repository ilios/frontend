import { findAll } from '@ember/test-helpers';
import { deprecate } from '@ember/debug';

export async function getElementText(element) {
  deprecate(`getText called, use qunit dom methods or page objects instead.`, false, {
    id: 'common.getText',
    for: 'ilios-common',
    until: '62',
    since: '61.1.0',
  });
  let elements;
  if (typeof element !== 'string') {
    if (Array.isArray(element)) {
      elements = element;
    } else {
      elements = [element];
    }
  } else {
    elements = await findAll(element);
  }
  const strings = elements.map((e) => e.textContent.replace(/[\t\n\s]+/g, ''));
  return strings.join('');
}

export function getText(string) {
  deprecate(`getText called, use qunit dom methods or page objects instead.`, false, {
    id: 'common.getText',
    for: 'ilios-common',
    until: '62',
    since: '61.1.0',
  });
  return string.replace(/[\t\n\s]+/g, '');
}
