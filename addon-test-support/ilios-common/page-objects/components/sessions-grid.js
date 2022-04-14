import { clickable, create, collection, notHasClass, isPresent, text } from 'ember-cli-page-object';
import offerings from './sessions-grid-offering-table';

const definition = {
  scope: '[data-test-sessions-grid]',
  sessions: collection('[data-test-session]', {
    expand: clickable('[data-test-expand-collapse-control] [data-test-expand]'),
    collapse: clickable('[data-test-expand-collapse-control] [data-test-collapse]'),
    canExpand: notHasClass('disabled', '[data-test-expand-collapse-control] [data-test-expand]'),
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
    hasPrerequisites: isPresent('[data-test-status] [data-test-prerequisites]'),
  }),
  expandedSessions: collection('[data-test-expanded-session]', {
    lastUpdated: text('.sessions-grid-last-updated'),
  }),
  noResults: {
    scope: '[data-test-no-results]',
  },
};

export default definition;
export const component = create(definition);
