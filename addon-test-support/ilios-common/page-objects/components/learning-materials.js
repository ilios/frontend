import {
  attribute,
  clickable,
  clickOnText,
  collection,
  fillable,
  isVisible,
  text,
  value
} from 'ember-cli-page-object';
import meshManager from './mesh-manager';
import search from './learningmaterial-search';
import {
  datePicker,
  pageObjectFillInFroalaEditor,
  pageObjectFroalaEditorValue
} from 'ilios-common';

export default {
  scope: '[data-test-detail-learning-materials]',
  search,
  createNew: clickable('.detail-learningmaterials-actions [data-test-choose-material-type] [data-test-toggle]'),
  pickNew: clickOnText('.detail-learningmaterials-actions [data-test-choose-material-type] [data-test-item]'),
  save: clickable('.actions button.bigadd'),
  cancel: clickable('.actions button.bigcancel'),
  canCreateNew: isVisible('.detail-learningmaterials-actions [data-test-choose-material-type]'),
  canCollapse: isVisible('.detail-learningmaterials-actions .collapse-button'),
  current: collection('.detail-learningmaterials-content table tbody tr', {
    title: text('td [data-test-title]', { at: 0 }),
    owner: text('td', { at: 1 }),
    required: text('td', { at: 2 }),
    notes: text('td', { at: 3 }),
    mesh: text('td', { at: 4 }),
    status: text('td', { at: 5 }),
    isNotePublic: isVisible('.fa-eye'),
    isTimedRelease: isVisible('.fa-clock'),
    details: clickable('.link', { at: 0 }),
  }),
  newLearningMaterial: {
    scope: '.new-learningmaterial',
    name: fillable('input', { at: 0 }),
    author: fillable('input', { at: 1 }),
    url: fillable('input', { at: 2 }),
    citation: fillable('textarea'),
    userName: text('.owninguser'),
    status: fillable('select', { at: 0 }),
    role: fillable('select', { at: 1 }),
    description: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  manager: {
    scope: '.learningmaterial-manager',
    name: {
      scope: '.displayname input'
    },
    nameValue: text('.displayname span'),
    author: text('.originalauthor'),
    description: {
      scope: '.description',
      value: text(),
      update: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      editorValue: pageObjectFroalaEditorValue('[data-test-html-editor]')
    },
    copyrightPermission: text('.copyrightpermission'),
    copyrightRationale: text('.copyrightrationale'),
    uploadDate: text('.upload-date'),
    downloadText: text('.downloadurl a'),
    downloadUrl: attribute('href', '.downloadurl a'),
    link: text('.link a'),
    citation: text('.citation'),
    hasCopyrightPermission: isVisible('.copyrightpermission'),
    hasCopyrightRationale: isVisible('.copyrightrationale'),
    hasLink: isVisible('.link'),
    hasCitation: isVisible('.citation'),
    hasFile: isVisible('.downloadurl'),
    required: clickable('.required .switch-handle'),
    publicNotes: clickable('.publicnotes .switch-handle'),
    status: fillable('select', { at: 0 }),
    statusValue: value('select', { at: 0 }),
    notes: {
      scope: '.notes',
      update: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      value: pageObjectFroalaEditorValue('[data-test-html-editor]'),
    },
    addStartDate: clickable('[data-test-add-start-date]'),
    addEndDate: clickable('[data-test-add-end-date]'),
    timedReleaseSummary: text('.timed-release-schedule'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    meshManager,
    startDate: datePicker('.start-date input'),
    startTime: {
      scope: '.start-time',
      hour: fillable('select', { at: 0 }),
      minute: fillable('select', { at: 1 }),
      ampm: fillable('select', { at: 2 }),
    },
    endDate: datePicker('.end-date input'),
    endTime: {
      scope: '.end-time',
      hour: fillable('select', { at: 0 }),
      minute: fillable('select', { at: 1 }),
      ampm: fillable('select', { at: 2 }),
    },
    hasEndDateValidationError: isVisible('[data-test-end-date-validation-error-message]'),
    hasTitleValidationError: isVisible('[data-test-title-validation-error-message]')
  },
};
