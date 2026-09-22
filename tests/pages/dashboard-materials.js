import { create, visitable } from 'ember-cli-page-object';
import materials from './components/dashboard/materials';
import navigation from './components/dashboard/navigation';

export default create({
  visit: visitable('/dashboard/materials'),
  navigation,
  materials,
});
