import { create, text } from 'ember-cli-page-object';

import form from 'ilios/tests/pages/components/school-session-type-form';

const definition = {
  scope: '[data-test-school-session-type-manager]',
  title: text('[data-test-school-session-type-manager-title]'),
  form,
};

export default definition;
export const component = create(definition);
