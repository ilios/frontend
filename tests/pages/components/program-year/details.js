import { create } from 'ember-cli-page-object';
import objectives from './objectives';

import competencies from './competencies';
const definition = {
  scope: '[data-test-program-year-details]',
  objectives,
  competencies,
};

export default definition;
export const component = create(definition);
