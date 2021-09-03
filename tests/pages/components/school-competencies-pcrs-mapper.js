import { collection, create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-competencies-pcrs-mapper]',
  pcrs: collection('[data-test-pcrs]', {
    isChecked: property('checked', 'input'),
  }),
};

export default definition;
export const component = create(definition);
