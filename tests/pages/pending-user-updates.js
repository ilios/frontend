import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
  visitable,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

export default create({
  visit: visitable('/admin/userupdates'),
  schoolFilter: {
    scope: '[data-test-school-filter]',
    isSelectable: isPresent('select'),
    select: fillable('select'),
    options: collection('option', {
      selected: property('selected'),
    }),
  },
  titleFilter: {
    scope: '[data-test-title-filter]',
  },
  updates: collection('[data-test-pending-update]', {
    userNameInfo,
    updateType: text('[data-test-update-type]'),
    updateEmailAddress: clickable('[data-test-update-email]'),
    canUpdateEmailAddress: isPresent('[data-test-update-email]'),
    excludeFromSync: clickable('[data-test-exclude-from-sync]'),
    disableUser: clickable('[data-test-disable-user]'),
  }),
});
