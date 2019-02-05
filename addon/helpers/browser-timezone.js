import { helper } from '@ember/component/helper';

export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export default helper(browserTimezone);
