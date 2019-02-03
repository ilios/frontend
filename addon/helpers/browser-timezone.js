import { helper } from '@ember/component/helper';
import moment from 'moment';

export function browserTimezone() {
  return moment.tz.guess();
}

export default helper(browserTimezone);
