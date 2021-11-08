import {
  clickable,
  collection,
  create,
  hasClass,
  isVisible,
  property,
  text,
  triggerable,
} from 'ember-cli-page-object';
import objectives from './session/objectives';
import learningMaterials from './learning-materials';
import meshTerms from './mesh-terms';
import taxonomies from './detail-taxonomies';
import collapsedTaxonomies from './collapsed-taxonomies';
import collapsedObjectives from './session/collapsed-objectives';
import instructorSelectionManager from './instructor-selection-manager';
import offeringForm from './offering-form';
import leadershipCollapsed from './leadership-collapsed';
import leadershipExpanded from './session-leadership-expanded';
import detailLearnersAndLearnerGroups from './detail-learners-and-learner-groups';
import userNameInfo from './user-name-info';
import overview from './session-overview';

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
  learnersAreVisible: isVisible('[data-test-detail-learners-and-learner-groups]'),
  instructorsAreVisible: isVisible('[data-test-detail-instructors]'),
  instructors: {
    scope: '[data-test-detail-instructors]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    title: text('.detail-instructors-header .title'),
    currentGroups: collection('[data-test-instructor-group]', {
      title: text('[data-test-instructor-group-title]'),
      members: collection('[data-test-instructor-group-members] li', {
        userNameInfo,
      }),
    }),
    currentInstructors: collection('[data-test-instructors] li', {
      title: text(),
    }),
    manager: instructorSelectionManager,
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
          title: text(),
          expandTooltip: triggerable('mouseover'),
          closeTooltip: triggerable('mouseout'),
          tooltipContents: text('.ilios-tooltip', { resetScope: true }),
          isTooltipVisible: isVisible('.ilios-tooltip', {
            resetScope: true,
          }),
        }),
        location: text('[data-test-location]'),
        url: property('href', '[data-test-url] a'),
        hasUrl: isVisible('[data-test-url]'),
        instructors: collection('.offering-manager-instructors [data-test-instructor]', {
          userNameInfo,
        }),
        edit: clickable('.edit'),
        remove: clickable('.remove'),
        hasRemoveConfirm: hasClass('show-remove-confirmation'),
        removeConfirmMessage: text('.confirm-message'),
        confirmRemoval: clickable('.remove', { scope: '.confirm-buttons' }),
        cancelRemoval: clickable('.cancel', { scope: '.confirm-buttons' }),
        offeringForm,
      }),
    }),
    offeringForm,
    smallGroup: clickable('.choose-offering-type button', { at: 0 }),
    singleOffering: clickable('.choose-offering-type button', { at: 1 }),
  },
});
