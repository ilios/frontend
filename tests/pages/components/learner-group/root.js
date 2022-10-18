import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  isVisible,
  text,
  value,
} from 'ember-cli-page-object';
import header from '../learnergroup-header';
import cohortUserManager from '../learnergroup-cohort-user-manager';
import instructorManager from '../learnergroup-instructor-manager';
import bulkAssignment from '../learnergroup-bulk-assign';
import userManager from '../learnergroup-user-manager';
import subgroupList from '../learner-groups/list';
import calendar from '../learnergroup-calendar';
import newLearnerGroupForm from '../learner-groups/new';
import toggleButtons from 'ilios-common/page-objects/components/toggle-buttons';
import toggleYesNo from 'ilios-common/page-objects/components/toggle-yesno';

const definition = {
  scope: '[data-test-learner-group-root]',
  header,
  needsAccommodation: {
    scope: '[data-test-needs-accommodation]',
    label: text('label'),
    toggle: toggleYesNo,
  },
  defaultLocation: {
    scope: '[data-test-location]',
    label: text('label'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    errors: collection('.validation-error-message'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
    isEditable: isPresent('[data-test-edit]'),
  },
  defaultUrl: {
    scope: '[data-test-url]',
    label: text('label'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    errors: collection('.validation-error-message'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
    isEditable: isPresent('[data-test-edit]'),
  },
  associatedCourses: {
    scope: '[data-test-courses]',
    label: text('label'),
    courses: collection('li', {
      linksTo: attribute('href', 'a'),
    }),
  },
  instructorManager,
  actions: {
    scope: '[data-test-overview-actions]',
    title: text('[data-test-title]'),
    buttons: {
      scope: '[data-test-buttons]',
      close: {
        scope: '[data-test-close]',
      },
      toggle: toggleButtons,
      bulkAssignment: {
        scope: '[data-test-activate-bulk-assign]',
      },
      manageUsers: {
        scope: '[data-test-manage]',
      },
    },
  },
  bulkAssignment,
  userManager,
  calendar,
  subgroups: {
    scope: '[data-test-subgroups]',
    title: text('h3'),
    toggleNewLearnerGroupForm: clickable('[data-test-expand-collapse-button] button'),
    toggleNewLearnerGroupFormExists: isVisible('[data-test-expand-collapse-button]'),
    newLearnerGroupForm,
    list: subgroupList,
    savedResult: text('.saved-result'),
    emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
  },
  cohortUserManager,
};

export default definition;
export const component = create(definition);
