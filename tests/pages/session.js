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
import objectives from 'ilios/tests/pages/components/objectives';
import learningMaterials from 'ilios/tests/pages/components/learning-materials';
import meshTerms from 'ilios/tests/pages/components/mesh-terms';
import taxonomies from 'ilios/tests/pages/components/taxonomies';
import collapsedTaxonomies from 'ilios/tests/pages/components/collapsed-taxonomies';
import learnerGroupManager from 'ilios/tests/pages/components/learner-group-manager';
import instructorSelectionManager from 'ilios/tests/pages/components/instructor-selection-manager';
import offeringForm from 'ilios/tests/pages/components/offering-form';
import { datePicker } from 'ilios/tests/helpers/date-picker';
import { fillInFroalaEditor } from 'ilios/tests/helpers/froala-editor';

export default create({
  scope: '[data-test-session-details]',
  visit: visitable('/courses/:courseId/sessions/:sessionId'),

  overview: {
    scope: '[data-test-session-overview]',
    title: {
      scope: '.session-header',
      title: text('.editable'),
      edit: clickable('.clickable'),
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
      edit: clickable('.clickable'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    sessionDescription: {
      scope: '.sessiondescription',
      value: text('span', { at: 0}),
      edit: clickable('.editable'),
      set: fillInFroalaEditor('.fr-box'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      hasError: isVisible('.validation-error-message')
    },
    ilmHours: {
      scope: '.sessionilmhours',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message'),
    },
    ilmDueDate: {
      scope: '.sessionilmduedate',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
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
    objectives: collection({
      scope: '.parent-picker',
      itemScope: 'li',
      item: {
        title: text(),
        selected: hasClass('selected'),
        notSelected: notHasClass('selected'),
      }
    }),
  },

  learnerGroups: {
    scope: '[data-test-detail-learner-groups]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection({
      scope: '.trees',
      itemScope: 'fieldset',
      item: {
        title: text('legend'),
        groups: collection({
          scope: 'ul',
          itemScope: 'li',
          item: {
            title: text(),
            isTopLevelGroup: hasClass('top-level-group')
          }
        })
      },
    }),
    manager: learnerGroupManager,
  },

  instructors: {
    scope: '[data-test-detail-instructors]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    title: text('.detail-instructors-header .title'),
    currentGroups: collection({
      scope: '[data-test-instructor-groups]',
      itemScope: 'li',
      item: {
        title: text(),
      },
    }),
    currentInstructors: collection({
      scope: '[data-test-instructors]',
      itemScope: 'li',
      item: {
        title: text(),
      },
    }),
    manager: instructorSelectionManager,
  },

  collapseLearnerGroups: {
    scope: '[data-test-collapsed-learnergroups]',
    title: text('.title'),
    headers: collection({
      scope: 'thead',
      itemScope: 'th',
      item: {
        title: text(),
      },
    }),
    cohorts: collection({
      scope: 'tbody',
      itemScope: 'tr',
      item: {
        name: text('td', { at: 0 }),
        learnerGroups: text('td', { at: 1 }),
      },
    }),
  },

  offerings: {
    scope: '[data-test-session-offerings]',
    header: {
      scope: '.offering-section-top',
      title: text('.title'),
      createNew: clickable('.actions button'),
    },
    dateBlocks: collection({
      scope: '[data-test-session-offerings-list]',
      itemScope: '.offering-block',
      item: {
        dayOfWeek: text('.offering-block-date-dayofweek'),
        dayOfMonth: text('.offering-block-date-dayofmonth'),
        startTime: text('.offering-block-time-time-starttime'),
        hasStartTime: isVisible('.offering-block-time-time-starttime'),
        endTime: text('.offering-block-time-time-endtime'),
        hasEndTime: isVisible('.offering-block-time-time-endtime'),
        multiDay: text('.multiday-offering-block-time-time'),
        hasMultiDay: isVisible('.multiday-offering-block-time-time'),
        offerings: collection({
          scope: '[data-test-offerings]',
          itemScope: '[data-test-offering-manager]',
          item: {
            learnerGroups: collection({
              scope: '.offering-manager-learner-groups',
              itemScope: 'li',
              item: {
                title: text()
              }
            }),
            location: text('.offering-manager-location'),
            instructors: collection({
              scope: '.offering-manager-instructors',
              itemScope: '[data-test-instructor]',
              item: {
                title: text()
              }
            }),
            edit: clickable('.edit'),
            remove: clickable('.remove'),
            hasRemoveConfirm: hasClass('show-remove-confirmation'),
            removeConfirmMessage: text('.confirm-message'),
            confirmRemoval: clickable('.remove', { scope: '.confirm-buttons'}),
            cancelRemoval: clickable('.cancel', { scope: '.confirm-buttons' }),
            offeringForm,
          }
        }),
      }
    }),
    offeringForm,
    smallGroup: clickable('.choose-offering-type button', { at: 0}),
    singleOffering: clickable('.choose-offering-type button', { at: 1}),
  },
});
