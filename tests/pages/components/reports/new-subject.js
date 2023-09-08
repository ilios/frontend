import { clickable, create, collection, fillable, property, text } from 'ember-cli-page-object';
import meshTerm from './subject/new/mesh-term';
import instructor from './subject/new/instructor';
import course from './subject/new/course';

const definition = {
  scope: '[data-test-reports-new-subject]',
  componentTitle: text('[data-test-component-title]'),
  title: {
    label: text('label'),
    scope: '[data-test-title]',
    set: fillable('input'),
    errors: collection('.validation-error-message'),
  },
  schools: {
    label: text('label'),
    scope: '[data-test-school]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  subjects: {
    label: text('label'),
    scope: '[data-test-subject]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  objects: {
    label: text('label'),
    scope: '[data-test-object]',
    choose: fillable('select'),
    items: collection('option', {
      isSelected: property('selected'),
    }),
    errors: collection('.validation-error-message'),
  },
  academicYears: {
    scope: '[data-test-report-academic-years]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  instructor,
  meshTerm,
  course,
  prepositionalObjects: {
    scope: '[data-test-prepositional-objects]',
    choose: fillable(),
    items: collection('option', {
      isSelected: property('selected'),
    }),
  },
  errors: collection('[data-test-validation-error]'),
  cancel: clickable('[data-test-cancel]'),
  save: clickable('[data-test-save]'),
};

export default definition;
export const component = create(definition);
