import {
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  isVisible,
  text,
  value,
  visitable,
} from 'ember-cli-page-object';
import learnerGroupList from './components/learnergroup-list';
import newLearnerGroup from './components/learner-groups/new';

export default create({
  scope: '[data-test-learner-groups-list]',
  visit: visitable('/learnergroups'),
  filterByTitle: fillable('[data-test-title-filter]'),
  schoolFilter: {
    scope: '[data-test-school-filter]',
    hasMany: isPresent('select'),
    filter: fillable('select'),
    filterValue: value('select'),
    list: collection('select option'),
  },
  programFilter: {
    scope: '[data-test-program-filter]',
    hasMany: isPresent('select'),
    filter: fillable('select'),
    filterValue: value('select'),
    list: collection('select option'),
  },
  programYearFilter: {
    scope: '[data-test-program-year-filter]',
    hasMany: isPresent('select'),
    filter: fillable('select'),
    filterValue: value('select'),
    list: collection('select option'),
  },
  learnerGroupList,
  newLearnerGroup,
  emptyListRowIsVisible: isVisible('[data-test-empty-list]'),
  savedResult: text('.saved-result'),
  toggleNewLearnerGroupForm: clickable('[data-test-expand-collapse-button] button'),
});
