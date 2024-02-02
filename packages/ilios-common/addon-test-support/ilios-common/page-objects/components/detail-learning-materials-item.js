import { clickable, create, isVisible, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
import typeIcon from './lm-type-icon';

const definition = {
  scope: '[data-test-detail-learning-materials-item]',
  view: clickable('[data-test-view]'),
  title: text('[data-test-title]'),
  userNameInfo,
  typeIcon,
  required: text('[data-test-required]'),
  notes: text('[data-test-notes]'),
  mesh: text('[data-test-mesh]'),
  status: text('[data-test-status]'),
  isNotePublic: isVisible('[data-test-visible-to-students]'),
  isTimedRelease: isVisible('[data-test-timed-release]'),
  details: clickable('button', { at: 0 }),
  actions: {
    scope: '[data-test-actions]',
    edit: {
      scope: '[data-test-edit]',
    },
    remove: {
      scope: '[data-test-remove]',
    },
  },
  confirmRemoval: {
    resetScope: true,
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
