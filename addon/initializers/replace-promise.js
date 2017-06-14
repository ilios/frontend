import RSVP from 'rsvp';

export function initialize() {
  window.Promise = RSVP.Promise;
}

export default {
  name: 'replace-promise',
  initialize
};
