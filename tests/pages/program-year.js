import { create, visitable } from 'ember-cli-page-object';
import details from './components/program-year/details';
import overview from './components/program-year/overview';
import header from './components/program-year/header';

export default create({
  visit: visitable('/programs/:programId/programyears/:programYearId'),
  details,
  overview,
  header,
});
