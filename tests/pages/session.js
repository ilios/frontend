import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isVisible,
  notHasClass,
  text,
  value,
  visitable
} from 'ember-cli-page-object';
import objectives from 'ilios/tests/pages/components/objectives';
import learningMaterials from 'ilios/tests/pages/components/learning-materials';
import meshTerms from 'ilios/tests/pages/components/mesh-terms';
import taxonomies from 'ilios/tests/pages/components/taxonomies';
import collapsedTaxonomies from 'ilios/tests/pages/components/collapsed-taxonomies';

export default create({
  scope: '[data-test-session-details]',
  visit: visitable('/courses/:courseId/sessions/:sessionId'),

  overview: {
    scope: '[data-test-session-overview]',
    header: {
      scope: '.session-header',
      title: text('.editable'),
      edit: clickable('.clickable'),
      set: fillable('input'),
      save: clickable('.done')
    },
    copy: {
      scope: 'a.copy',
      visit: clickable(),
      link: attribute('href'),
      visible: isVisible(),
    },
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
