import { clickable, collection, create, isVisible, text } from 'ember-cli-page-object';
import members from './selected-instructor-group-members';
const definition = {
  scope: '[data-test-selected-instructor-groups]',
  heading: text('[data-test-heading]'),
  instructorGroups: collection('[data-test-selected-instructor-group]', {
    title: text('[data-test-instructor-group-title]'),
    isRemovable: isVisible('[data-test-instructor-group-title] button'),
    remove: clickable('[data-test-instructor-group-title] button'),
    members,
  }),
  noGroups: {
    scope: '[data-test-no-selected-instructor-groups]',
  },
};

export default definition;
export const component = create(definition);
