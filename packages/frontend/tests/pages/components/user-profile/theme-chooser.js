import { clickable, collection, create, hasClass, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-theme-chooser]',
  title: text('[data-test-title]'),
  choices: collection('[data-test-chooser] li', {
    label: text('span'),
    isActive: hasClass('active'),
    isChecked: property('checked', 'input'),
    choose: clickable('input'),
  }),
};

export default definition;
export const component = create(definition);
