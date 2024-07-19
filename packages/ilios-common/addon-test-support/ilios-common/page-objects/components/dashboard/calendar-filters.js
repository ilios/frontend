import { collection, create, text } from 'ember-cli-page-object';
import c from './filter-checkbox';
import cohortsFilter from './cohort-calendar-filter';
import coursesFilter from './courses-calendar-filter';
import selectedVocabulary from './selected-vocabulary';

const definition = {
  scope: '[data-test-dashboard-calendar-filters]',
  coursesFilter,
  sessionTypesFilter: {
    scope: '[data-test-session-type-filter]',
    title: text('h5'),
    sessionTypes: collection('li', c),
  },
  vocabularyFilter: {
    scope: '[data-test-vocabulary-filter]',
    title: text('h5'),
    sessionTypes: collection('li', c),
    vocabularies: collection('[data-test-dashboard-selected-vocabulary]', selectedVocabulary),
  },
  courseLevelsFilter: {
    scope: '[data-test-course-level-filter]',
    title: text('h5'),
    courseLevels: collection('li', c),
  },
  cohortsFilter,
};

export default definition;
export const component = create(definition);
