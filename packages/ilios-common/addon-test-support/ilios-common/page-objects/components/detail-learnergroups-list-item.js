import { clickable, create, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-learnergroups-list-item]',
  needsAccommodation: isPresent('[data-test-needs-accommodation]'),
  remove: clickable('[data-test-remove-learnergroup]'),
  isRemovable: isPresent('[data-test-remove-learnergroup]'),
};

export default definition;
export const component = create(definition);
