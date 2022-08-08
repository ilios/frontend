import { create, clickable, text } from 'ember-cli-page-object';
import leadershipList from 'ilios-common/page-objects/components/leadership-list';
import leadershipManager from 'ilios-common/page-objects/components/leadership-manager';

const definition = {
  scope: '[data-test-program-year-leadership-expanded]',
  title: text('.title'),
  collapse: clickable('.title'),
  manage: clickable('.actions button'),
  save: clickable('.actions button.bigadd'),
  cancel: clickable('.actions button.bigcancel'),
  leadershipList,
  leadershipManager,
};

export default definition;
export const component = create(definition);
