import { find } from '@ember/test-helpers';

export async function getElementText(element) {
  if (typeof element === 'string'){
    element = await find(element);
  }
  return element.textContent.replace(/[\t\n\s]+/g, "");
}

export function getText(string) {
  return string.replace(/[\t\n\s]+/g, "");
}
