import { create, visitable } from 'ember-cli-page-object';

import objectives from './components/program-year/objectives';
import competencies from './components/program-year/competencies';

export default create({
  scope: '[data-test-program-year-details]',
  visit: visitable('/programs/:programId/programyears/:programYearId'),
  objectives,
  competencies,
});
