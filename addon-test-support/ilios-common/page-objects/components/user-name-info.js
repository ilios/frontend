import { attribute, create, isVisible, text, triggerable } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-name-info]',
  fullName: text('[data-test-fullname]'),
  hasAdditionalInfo: isVisible('[data-test-info]'),
  infoIconLabel: attribute('aria-label', '[data-test-info] svg'),
  expandTooltip: triggerable('mouseover', '[data-test-info] .info'),
  closeTooltip: triggerable('mouseout', '[data-test-info] .info'),
  tooltipContents: text('.ilios-tooltip', { resetScope: true }),
  isTooltipVisible: isVisible('.ilios-tooltip', { resetScope: true }),
};

export default definition;
export const component = create(definition);
