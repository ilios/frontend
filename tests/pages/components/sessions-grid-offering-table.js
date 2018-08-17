import {
  clickable,
  collection,
  text
} from 'ember-cli-page-object';
import offeringForm from 'ilios/tests/pages/components/offering-form';

export default {
  scope: '[data-test-sessions-grid-offering-table]',
  dates: collection('[data-test-offering-block-date]', {
    dayOfWeek: text('[data-test-dayofweek]'),
    dayOfMonth: text('[data-test-dayofmonth]'),
  }),
  offerings: collection('[data-test-sessions-grid-offering]', {
    startTime: text('[data-test-starttime]'),
    duration: text('[data-test-duration]'),
    location: text('td', { at: 1 }),
    learners: text('td', { at: 2 }),
    learnerGroups: text('td', { at: 3 }),
    instructors: text('td', { at: 4 }),
    edit: clickable('td:nth-of-type(6) .link'),
    offeringForm,
  })
};
