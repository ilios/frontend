import { clickable, create, isPresent, text } from 'ember-cli-page-object';

const definition = create({
  scope: '[data-test-school-emails]',
  title: text('[data-test-title]'),
  manage: clickable('[data-test-manage]'),
  canManage: isPresent('[data-test-manage]'),
  administratorEmail: {
    scope: '[data-test-administrator-email]',
    label: text('strong'),
    value: text('span'),
  },
  changeAlertRecipients: {
    scope: '[data-test-change-alert-recipients]',
    label: text('strong'),
    value: text('span'),
  },
});

export default definition;
export const component = create(definition);
