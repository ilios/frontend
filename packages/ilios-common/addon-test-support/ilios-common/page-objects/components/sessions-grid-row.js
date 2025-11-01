import { clickable, create, isVisible, notHasClass, isPresent, text } from 'ember-cli-page-object';
import publicationStatus from './publication-status';
const definition = {
  scope: '[data-test-sessions-grid-row]',
  expand: clickable('[data-test-expand-collapse-control] [data-test-expand]'),
  collapse: clickable('[data-test-expand-collapse-control] [data-test-collapse]'),
  isCollapsed: isVisible('[data-test-expand-collapse-control] [data-test-expand]'),
  isExpanded: isVisible('[data-test-expand-collapse-control] [data-test-collapse]'),
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
  publicationStatus,
  prerequisites: {
    scope: '[data-test-prerequisites]',
    title: text('title'),
  },
  trash: clickable('[data-test-actions] .remove'),
  hasInstructionalNotes: isPresent('[data-test-status] .instructional-notes'),
  hasPrerequisites: isPresent('[data-test-status] [data-test-prerequisites]'),
};

export default definition;
export const component = create(definition);
