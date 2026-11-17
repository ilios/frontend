import { clickable, create, text } from 'ember-cli-page-object';

import newObjective from './../new-objective';
import objectiveList from './objective-list';

const definition = {
  scope: '[data-test-session-objectives]',
  title: text('[data-test-title]'),
  createNew: clickable('[data-test-actions] [data-test-expand-collapse-button] button'),
  newObjective,
  objectiveList,
};

export default definition;
export const component = create(definition);
