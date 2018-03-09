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

});
