import { create, visitable } from 'ember-cli-page-object';

import details from './components/program-year/details';
import header from './components/program-year/header';
import overview from './components/program-year/overview';

export default create({
  visit: visitable('/programs/:programId/programyears/:programYearId'),
  details,
  overview,
  header,
});
