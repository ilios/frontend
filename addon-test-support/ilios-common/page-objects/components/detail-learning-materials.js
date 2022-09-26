import {
  attribute,
  clickable,
  clickOnText,
  create,
  collection,
  fillable,
  isVisible,
  text,
  value,
} from 'ember-cli-page-object';
import meshManager from './mesh-manager';
import search from './learningmaterial-search';
import newLearningMaterial from './new-learningmaterial';
import datePicker from './date-picker';
import timePicker from './time-picker';
import items from './detail-learning-materials-item';
import { pageObjectFillInFroalaEditor, pageObjectFroalaEditorValue } from 'ilios-common';

const definition = {
  scope: '[data-test-detail-learning-materials]',
  search,
  createNew: clickable(
    '.detail-learningmaterials-actions [data-test-choose-material-type] [data-test-toggle]'
  ),
  pickNew: clickOnText(
    '.detail-learningmaterials-actions [data-test-choose-material-type] [data-test-item]'
  ),
  save: clickable('.actions button.bigadd'),
  cancel: clickable('.actions button.bigcancel'),
  canCreateNew: isVisible('.detail-learningmaterials-actions [data-test-choose-material-type]'),
  canCollapse: isVisible('.detail-learningmaterials-actions .collapse-button'),
  canSort: isVisible('[data-test-sort-button]'),
  sort: clickable('[data-test-sort-button]'),
  current: collection('[data-test-detail-learning-materials-item]', items),
  newLearningMaterial,
  manager: {
    scope: '.learningmaterial-manager',
    name: {
      scope: '.displayname input',
    },
    nameValue: text('.displayname span'),
    author: text('.originalauthor'),
    description: {
      scope: '.description',
      value: text(),
      update: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      editorValue: pageObjectFroalaEditorValue('[data-test-html-editor]'),
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
    startDate: {
      scope: '.start-date',
      datePicker,
    },
    startTime: {
      scope: '.start-time',
      timePicker,
    },
    endDate: {
      scope: '.end-date',
      datePicker,
    },
    endTime: {
      scope: '.end-time',
      timePicker,
    },
    hasEndDateValidationError: isVisible('[data-test-end-date-validation-error-message]'),
    hasTitleValidationError: isVisible('[data-test-title-validation-error-message]'),
  },
  sortManager: {
    scope: '[data-test-detail-learning-materials-sort-manager]',
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
