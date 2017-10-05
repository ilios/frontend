import Ember from 'ember';
import moment from 'moment';

export function browserTimezone() {
  return moment.tz.guess();
}

export default Ember.Helper.helper(browserTimezone);
