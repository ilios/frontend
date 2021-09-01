import { clickable, collection, create, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-competencies-list-item-pcrs]',
  save: {
    scope: '[data-test-save]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
  items: collection('li', {
    edit: clickable('button'),
    isEditable: isPresent('button'),
  }),
};

export default definition;
export const component = create(definition);
