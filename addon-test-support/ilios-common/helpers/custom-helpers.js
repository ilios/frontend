import { findAll } from '@ember/test-helpers';

export async function getElementText(element) {
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
  const strings = elements.map(e => e.textContent.replace(/[\t\n\s]+/g, ""));
  return strings.join('');
}

export function getText(string) {
  return string.replace(/[\t\n\s]+/g, "");
}
