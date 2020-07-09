import {
  create,
  collection,
  clickable,
  hasClass,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-collapsed-objectives]',
  title: text('[data-test-title]'),
  expand: clickable('[data-test-title]'),
  headers: collection('thead th'),
  objectiveCount: text('[data-test-objective-count]'),
  parentCount: text('[data-test-parent-count]'),
  meshCount: text('[data-test-mesh-count]'),
  parentStatus: {
    scope: '[data-test-parent-status] svg',
    complete: hasClass('yes'),
    partial: hasClass('maybe'),
    none: hasClass('no'),
  },
  meshStatus: {
    scope: '[data-test-mesh-status] svg',
    complete: hasClass('yes'),
    partial: hasClass('maybe'),
    none: hasClass('no'),
  }

};

export default definition;
export const component = create(definition);
