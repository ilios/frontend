import {
  collection,
  create,
  clickable,
  hasClass,
  isPresent,
  isVisible,
  property,
  text,
  triggerable,
} from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
import offeringForm from './offering-form';

const definition = {
  scope: '[data-test-offering-manager]',
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
    isDisabled: isPresent('.disabled-user'),
    userNameInfo,
  }),
  edit: clickable('.edit'),
  remove: clickable('.remove'),
  hasRemoveConfirm: hasClass('show-remove-confirmation'),
  removeConfirmMessage: text('.confirm-message'),
  confirmRemoval: clickable('.remove', { scope: '.confirm-buttons' }),
  cancelRemoval: clickable('.cancel', { scope: '.confirm-buttons' }),
  offeringForm,
};

export default definition;
export const component = create(definition);
