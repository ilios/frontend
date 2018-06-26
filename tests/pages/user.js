import {
  clickable,
  create,
  is,
  text,
  visitable,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-user-profile]',
  visit: visitable('/users/:userId'),
  roles: {
    scope: '[data-test-user-profile-roles]',
    manage: clickable('[data-test-manage]'),
    save: clickable('[data-test-save]'),
    student: {
      scope: '.item:nth-of-type(1)',
      label: text('label'),
      value: text('.value'),
    },
    formerStudent: {
      scope: '.item:nth-of-type(2)',
      label: text('label'),
      value: text('.value'),
      selected: is(':checked', 'input'),
      click: clickable('input')
    },
    enabled: {
      scope: '.item:nth-of-type(3)',
      label: text('label'),
      value: text('.value'),
      selected: is(':checked', 'input'),
      click: clickable('input')
    },
    excludeFromSync: {
      scope: '.item:nth-of-type(4)',
      label: text('label'),
      value: text('.value'),
      selected: is(':checked', 'input'),
      click: clickable('input')
    },
  },
});
