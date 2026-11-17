import { clickable,create, isPresent } from 'ember-cli-page-object';

import newMultiple from './new-multiple';
import newSingle from './new-single';

const definition = {
  single: newSingle,
  multiple: newMultiple,
  singleGroupSelected: isPresent('[data-test-first-button].active'),
  multipleGroupSelected: isPresent('[data-test-second-button].active'),
  chooseSingleGroups: clickable('[data-test-first-button]'),
  chooseMultipleGroups: clickable('[data-test-second-button]'),
};

export default definition;
export const component = create(definition);
