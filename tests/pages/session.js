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
    manager: {
      scope: '[data-test-learnergroup-selection-manager]',
      search: fillable('.search-box input'),
      selectedLearnerGroups: collection({
        scope: '.trees',
        itemScope: 'fieldset',
        item: {
          title: text('legend'),
          groups: collection({
            scope: 'ul',
            itemScope: 'li',
            item: {
              title: text(),
              isTopLevelGroup: hasClass('top-level-group'),
              remove: clickable()
            }
          })
        },
      }),
      availableLearnerGroups: {
        scope: '.available-learner-groups',
        title: text('h4'),
        cohorts: collection({
          scope: '[data-test-cohorts]',
          itemScope: '[data-test-cohort]',
          item: {
            title: text('h5'),
            topLevelGroups: collection({
              scope: '.tree-groups-list',
              itemScope: '> [data-test-learnergroup-tree]',
              item: {
                title: text('> span'),
                enabled: notHasClass('disabled'),
                disabled: hasClass('disabled'),
                add: clickable('.clickable'),
                //this is recursive, but I can't figure out how to do that, so two levels will have to be enough
                groups: collection({
                  scope: 'ul',
                  itemScope: '> [data-test-learnergroup-tree]',
                  item: {
                    title: text('> span'),
                    enabled: notHasClass('disabled'),
                    disabled: hasClass('disabled'),
                    add: clickable('.clickable'),
                  }
                })
              }
            }),
          }
        }),
      }
    }
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
});
