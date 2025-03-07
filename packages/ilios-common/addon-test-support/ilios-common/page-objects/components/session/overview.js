import {
  attribute,
  clickable,
  create,
  fillable,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import postrequisiteEditor from './postrequisite-editor';
import yesNoToggle from '../toggle-yesno';
import ilm from './ilm';
import publicationStatus from '../publication-status';
import publicationMenu from './publication-menu';

const definition = {
  scope: '[data-test-session-overview]',
  title: {
    scope: '[data-test-title]',
    title: text('.editable'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    value: text(),
  },
  copy: {
    scope: '[data-test-copy]',
    visit: clickable(),
    link: attribute('href'),
    visible: isVisible(),
  },
  sessionType: {
    scope: '[data-test-session-type]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    hasError: isVisible('.validation-error-message'),
  },
  sessionDescription: {
    scope: '[data-test-description]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    savingIsDisabled: property('disabled', '.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
  },
  instructionalNotes: {
    scope: '[data-test-instructional-notes]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    savingIsDisabled: property('disabled', '.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
  },
  ilm,
  supplemental: {
    scope: '[data-test-supplemental]',
    yesNoToggle,
  },
  specialAttire: {
    scope: '[data-test-special-attire]',
    yesNoToggle,
  },
  specialEquipment: {
    scope: '[data-test-special-equipment]',
    yesNoToggle,
  },
  attendanceRequired: {
    scope: '[data-test-attendance-required]',
    yesNoToggle,
  },
  prerequisites: {
    scope: '[data-test-prerequisites]',
  },
  postrequisite: {
    scope: '[data-test-postrequisite]',
    value: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    editor: postrequisiteEditor,
  },
  lastUpdated: text('[data-test-last-update]'),
  associatedGroups: {
    scope: '[data-test-associated-groups]',
    label: text('label'),
    groups: text('span'),
  },
  publicationStatus,
  publicationMenu,
};

export default definition;
export const component = create(definition);
