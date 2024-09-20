import { create } from 'ember-cli-page-object';
import header from './subject-header';
import results from './results';

const definition = {
  header,
  results,
};

export default definition;
export const component = create(definition);
