import { clickable, create, collection, hasClass, property, text } from 'ember-cli-page-object';
export default create({
  scope: '[data-test-locale-chooser]',
  title: text('[data-test-title]'),
  choices: collection('[data-test-chooser] li', {
    label: text('span'),
    isActive: hasClass('active'),
    isChecked: property('checked', 'input'),
    choose: clickable('input'),
  }),
});
