import { create, isPresent, clickable } from 'ember-cli-page-object';
import newSingle from './new-single';
import newMultiple from './new-multiple';

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
