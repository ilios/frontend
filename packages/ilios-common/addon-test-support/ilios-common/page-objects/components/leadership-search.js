import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isPresent,
  text,
} from 'ember-cli-page-object';
import userStatus from './user-status';

const definition = {
  scope: '[data-test-leadership-search]',
  search: fillable('[data-test-search-input]'),
  results: collection('li', {
    isSummary: hasClass('summary'),
    isUser: hasClass('user'),
    isClickable: hasClass('clickable'),
    isInactive: hasClass('inactive'),
    name: {
      scope: '[data-test-name]',
      fullName: text('[data-test-fullname]'),
      userStatus,
    },
    email: text('[data-test-email]'),
    select: clickable('[data-test-select-user]'),
    isSelectable: isPresent('[data-test-select-user]'),
  }),
};

export default definition;
export const component = create(definition);
