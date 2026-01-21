import { clickable, collection, create, isVisible, text } from 'ember-cli-page-object';
import objectives from './session/objectives';
import learningMaterials from './detail-learning-materials';
import meshTerms from './mesh-terms';
import taxonomies from './detail-taxonomies';
import collapsedTaxonomies from './collapsed-taxonomies';
import collapsedObjectives from './session/collapsed-objectives';
import offeringForm from './offering-form';
import leadershipCollapsed from './leadership-collapsed';
import leadershipExpanded from './leadership-expanded';
import detailInstructors from './detail-instructors';
import detailLearnersAndLearnerGroups from './detail-learners-and-learner-groups';
import overview from './session/overview';
import timeBlockOfferings from './session-offerings-time-block-offerings';

export default create({
  scope: '[data-test-session-details]',
  overview,
  leadershipCollapsed,
  leadershipExpanded,
  collapsedObjectives,
  objectives,
  learningMaterials,
  meshTerms,
  taxonomies,
  collapsedTaxonomies,
  detailLearnersAndLearnerGroups,
  instructors: detailInstructors,
  learnersAreVisible: isVisible('[data-test-detail-learners-and-learner-groups]'),
  instructorsAreVisible: isVisible('[data-test-detail-instructors]'),
  offerings: {
    scope: '[data-test-session-offerings]',
    top: {
      scope: '.offering-section-top',
      title: text('.title'),
      createNew: clickable('.actions button'),
    },
    header: {
      scope: '[data-test-session-offerings-header]',
    },
    dateBlocks: collection('[data-test-session-offerings-list] .offering-block', {
      dayOfWeek: text('.offering-block-date-dayofweek'),
      dayOfMonth: text('.offering-block-date-dayofmonth'),
      startTime: text('.offering-block-time-time-starttime'),
      hasStartTime: isVisible('.offering-block-time-time-starttime'),
      endTime: text('.offering-block-time-time-endtime'),
      hasEndTime: isVisible('.offering-block-time-time-endtime'),
      multiDayStart: text('.offering-block-time-time-starts'),
      multiDayEnd: text('.offering-block-time-time-ends'),
      timeBlockOfferings,
    }),
    offeringForm,
    smallGroup: clickable('.choose-offering-type button', { at: 0 }),
    singleOffering: clickable('.choose-offering-type button', { at: 1 }),
  },
});
