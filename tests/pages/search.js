import {
  create,
  visitable
} from 'ember-cli-page-object';

import searchBox from 'ilios/tests/pages/components/global-search-box';

export default create({
  visit: visitable('/search'),
  scope: '[data-test-global-search]',
  searchBox,
});
