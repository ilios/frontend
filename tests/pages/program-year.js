import {
  create,
  visitable
} from 'ember-cli-page-object';

import objectives from './components/program-year/objectives';


export default create({
  scope: '[data-test-program-year-details]',
  visit: visitable('/programs/:programId/programyears/:programYearId'),
  objectives
});
