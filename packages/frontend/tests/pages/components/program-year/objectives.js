import { clickable, create, text } from 'ember-cli-page-object';
import newObjective from 'ilios-common/page-objects/components/new-objective';
import objectiveList from './objective-list';

const definition = {
  scope: '[data-test-program-year-objectives]',
  title: text('[data-test-title]'),
  hasCollapseIcon: {
    scope: '[data-test-collapse]',
  },
  createNew: clickable('[data-test-actions] [data-test-expand-collapse-button] button'),
  newObjective,
  objectiveList,
};

export default definition;
export const component = create(definition);
