import { create } from 'ember-cli-page-object';

import results from './results';
import header from './subject-header';

const definition = {
  header,
  results,
};

export default definition;
export const component = create(definition);
