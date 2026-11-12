import { create } from 'ember-cli-page-object';

import chooseCourse from './curriculum/choose-course';
import courseCompetenciesResult from './curriculum/course-competencies';
import header from './curriculum/header';
import learnerGroupsResult from './curriculum/learner-groups';
import sessionObjectivesResult from './curriculum/session-objectives';

const definition = {
  scope: '[data-test-reports-curriculum]',
  chooseCourse,
  header,
  learnerGroupsResult,
  sessionObjectivesResult,
  courseCompetenciesResult,
};

export default definition;
export const component = create(definition);
