import { create, visitable } from 'ember-cli-page-object';
import materials from './components/dashboard/materials';

export default create({
  visit: visitable('/dashboard/materials'),
  materials,
});
