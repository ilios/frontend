import {
  clickable,
  collection,
  hasClass,
  isPresent,
  text
} from 'ember-cli-page-object';
import offerings from './sessions-grid-offering-table';

export default {
  scope: '[data-test-sessions-grid]',
  sessions: collection('[data-test-session]', {
    expandCollapse: clickable('span:nth-of-type(1) .link'),
    canExpand: hasClass('link', '[data-test-expand-collapse-control] svg'),
    expandTitle: text('[data-test-expand-collapse-control] title'),
    title: text('span', { at: 1 }),
    visit: clickable('span:nth-of-type(2) a'),
    type: text('span', { at: 2 }),
    groupCount: text('span', { at: 3 }),
    objectiveCount: text('span', { at: 4 }),
    termCount: text('span', { at: 5 }),
    firstOffering: text('span', { at: 6 }),
    offeringCount: text('span', { at: 7 }),
    status: text('span', { at: 8 }),
    offerings,
    noOfferings: text('[data-test-no-offerings]'),
    trash: clickable('[data-test-actions] .remove'),
    confirm: clickable('[data-test-confirm-removal] [data-test-yes]'),
    hasInstructionalNotes: isPresent('[data-test-status] .instructional-notes'),
  }),
  expandedSessions: collection('[data-test-expanded-session]'),
};
