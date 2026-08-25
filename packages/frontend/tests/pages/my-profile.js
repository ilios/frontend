import { create, visitable } from 'ember-cli-page-object';
import iliosHeader from './components/ilios-header';
import profile from './components/my-profile';

export default create({
  visit: visitable('/myprofile'),
  iliosHeader,
  profile,
});
