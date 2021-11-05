import { create, visitable } from 'ember-cli-page-object';
import details from './components/program-year/details';

export default create({
  visit: visitable('/programs/:programId/programyears/:programYearId'),
  details,
});
