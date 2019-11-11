import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  is,
  isVisible,
  notHasClass,
  text,
  visitable
} from 'ember-cli-page-object';
import objectives from './components/objectives';
import learningMaterials from './components/learning-materials';
import meshTerms from './components/mesh-terms';
import taxonomies from './components/taxonomies';
import collapsedTaxonomies from './components/collapsed-taxonomies';
import learnerGroupManager from './components/learner-group-manager';
import instructorSelectionManager from './components/instructor-selection-manager';
import offeringForm from './components/offering-form';
import { datePicker } from 'ilios-common';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import leadershipCollapsed from './components/leadership-collapsed';
import leadershipList from './components/leadership-list';
import leadershipManager from './components/leadership-manager';

export default create({
  scope: '[data-test-session-details]',
  visit: visitable('/courses/:courseId/sessions/:sessionId'),

  overview: {
    scope: '[data-test-session-overview]',
    title: {
      scope: '.session-header',
      title: text('.editable'),
      edit: clickable('[data-test-edit]'),
      set: fillable('input'),
      save: clickable('.done'),
      value: text('.title')
    },
    copy: {
      scope: 'a.copy',
      visit: clickable(),
      link: attribute('href'),
      visible: isVisible(),
    },
    sessionType: {
      scope: '.sessiontype',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    sessionDescription: {
      scope: '.sessiondescription',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: pageObjectFillInFroalaEditor('.fr-box'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      hasError: isVisible('.validation-error-message')
    },
    instructionalNotes: {
      scope: '[data-test-instructional-notes]',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: pageObjectFillInFroalaEditor('.fr-box'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      hasError: isVisible('.validation-error-message')
    },
    ilmHours: {
      scope: '.sessionilmhours',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message'),
    },
    ilmDueDate: {
      scope: '.sessionilmduedate',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message'),
    },
    supplemental: {
      scope: '.sessionsupplemental',
      isActive: is(':checked', 'input'),
      click: clickable('.toggle-yesno'),
    },
    specialAttire: {
      scope: '.sessionspecialattire',
      isActive: is(':checked', 'input'),
      click: clickable('.toggle-yesno'),
    },
    specialEquipment: {
      scope: '.sessionspecialequipment',
      isActive: is(':checked', 'input'),
      click: clickable('.toggle-yesno'),
    },
    attendanceRequired: {
      scope: '.sessionattendancerequired',
      isActive: is(':checked', 'input'),
      click: clickable('.toggle-yesno'),
    },
    toggleIlm: clickable('.toggle-yesno', { scope: '.independentlearningcontrol' }),
    prerequisites: {
      scope: '.prerequisites',
    },
    postrequisite: {
      scope: '.postrequisite',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    lastUpdated: text('.last-update'),
  },

  leadershipCollapsed,
  leadershipExpanded: {
    scope: '[data-test-session-leadership-expanded]',
    title: text('.title'),
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    leadershipList,
    leadershipManager,
  },

  objectives,
  learningMaterials,
  meshTerms,
  taxonomies,
  collapsedTaxonomies,

  objectiveParentManager: {
    scope: '[data-test-session-objective-manager]',
    title: text('.objectivetitle'),
    courseTitle: text('h5'),
    objectives: collection('.parent-picker li', {
      title: text(),
      selected: hasClass('selected'),
      notSelected: notHasClass('selected'),
    }),
  },

  learnerGroups: {
    scope: '[data-test-detail-learner-groups]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection('.trees fieldset', {
      title: text('legend'),
      groups: collection('ul li', {
        title: text(),
        isTopLevelGroup: hasClass('top-level-group')
      })
    }),
    manager: learnerGroupManager,
  },

  instructors: {
    scope: '[data-test-detail-instructors]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    title: text('.detail-instructors-header .title'),
    currentGroups: collection('[data-test-instructor-group]', {
      title: text('[data-test-instructor-group-title]'),
      members: collection('[data-test-instructor-group-members] li', {
        text: text(),
      }),
    }),
    currentInstructors: collection('[data-test-instructors] li', {
      title: text(),
    }),
    manager: instructorSelectionManager,
  },

  collapseLearnerGroups: {
    scope: '[data-test-collapsed-learnergroups]',
    title: text('.title'),
    headers: collection('thead th', {
      title: text(),
    }),
    cohorts: collection('tbody tr', {
      name: text('td', { at: 0 }),
      learnerGroups: text('td', { at: 1 }),
    }),
  },

  offerings: {
    scope: '[data-test-session-offerings]',
    header: {
      scope: '.offering-section-top',
      title: text('.title'),
      createNew: clickable('.actions button'),
    },
    dateBlocks: collection('[data-test-session-offerings-list] .offering-block', {
      dayOfWeek: text('.offering-block-date-dayofweek'),
      dayOfMonth: text('.offering-block-date-dayofmonth'),
      startTime: text('.offering-block-time-time-starttime'),
      hasStartTime: isVisible('.offering-block-time-time-starttime'),
      endTime: text('.offering-block-time-time-endtime'),
      hasEndTime: isVisible('.offering-block-time-time-endtime'),
      multiDay: text('.multiday-offering-block-time-time'),
      hasMultiDay: isVisible('.multiday-offering-block-time-time'),
      offerings: collection('[data-test-offerings] [data-test-offering-manager]', {
        learnerGroups: collection('.offering-manager-learner-groups li', {
          title: text()
        }),
        location: text('.offering-manager-location'),
        instructors: collection('.offering-manager-instructors [data-test-instructor]', {
          title: text()
        }),
        edit: clickable('.edit'),
        remove: clickable('.remove'),
        hasRemoveConfirm: hasClass('show-remove-confirmation'),
        removeConfirmMessage: text('.confirm-message'),
        confirmRemoval: clickable('.remove', { scope: '.confirm-buttons'}),
        cancelRemoval: clickable('.cancel', { scope: '.confirm-buttons' }),
        offeringForm,
      }),
    }),
    offeringForm,
    smallGroup: clickable('.choose-offering-type button', { at: 0}),
    singleOffering: clickable('.choose-offering-type button', { at: 1}),
  },
});
