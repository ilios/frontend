import { create, visitable } from 'ember-cli-page-object';
import root from './components/program/root';
import programYears from './components/program-year/list';

export default create({
  visit: visitable('/programs/:programId'),
  root,
  programYears,
});
