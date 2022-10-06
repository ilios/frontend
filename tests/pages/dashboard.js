import { create, visitable } from 'ember-cli-page-object';
import iliosHeader from 'ilios/tests/pages/components/ilios-header';

export default create({
  visit: visitable('/dashboard/week'),
  iliosHeader,
});
