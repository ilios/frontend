import { collection, create, text } from 'ember-cli-page-object';

import cohortsFilter from './cohort-calendar-filter';
import coursesFilter from './courses-calendar-filter';
import c from './filter-checkbox';
import selectedVocabulary from './selected-vocabulary';
import sessionTypesFilter from './sessiontypes-calendar-filter';

const definition = {
  scope: '[data-test-dashboard-calendar-filters]',
  coursesFilter,
  sessionTypesFilter,
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
