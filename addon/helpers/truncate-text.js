import { helper } from '@ember/component/helper';

export function truncateText([input], hash = {}) {
  const max = hash.max || 100;
  input = `${input}`;
  return input.length > max ? `${input.substr(0, max).trim()}...` : input;
}

export default helper(truncateText);
