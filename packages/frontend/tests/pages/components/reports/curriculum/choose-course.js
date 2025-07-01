import {
  attribute,
  clickable,
  create,
  collection,
  isPresent,
  isVisible,
  fillable,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-curriculum-choose-course]',
  hasMultipleSchools: isPresent('[data-test-schools] select'),
  schoolSelector: {
    scope: '[data-test-schools]',
    set: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    value: property('value', 'select'),
  },
  years: collection('[data-test-year]', {
    title: text('[data-test-expand]'),
    isExpanded: isPresent('[data-test-courses]'),
    courses: collection('[data-test-course]', {
      isSelected: property('checked', 'input'),
      pick: clickable('input'),
    }),
    toggleAll: {
      scope: '[data-test-toggle-all]',
      isPartiallySelected: property('indeterminate'),
      isFullySelected: property('checked'),
      ariaLabel: attribute('aria-label'),
    },
  }),
  deselectAll: {
    scope: '[data-test-deselect-all]',
    visible: isVisible(),
    click: clickable(),
  },
};

export default definition;
export const component = create(definition);
