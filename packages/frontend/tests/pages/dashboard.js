import { create, visitable } from 'ember-cli-page-object';
import iliosHeader from 'frontend/tests/pages/components/ilios-header';

export default create({
  visit: visitable('/dashboard/week'),
  iliosHeader,
});
