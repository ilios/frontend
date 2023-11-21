import { create } from 'ember-cli-page-object';
import results from './results';

const definition = {
  results,
};

export default definition;
export const component = create(definition);
