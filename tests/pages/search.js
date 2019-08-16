import {
  collection,
  create,
  visitable
} from 'ember-cli-page-object';

import searchBox from 'ilios/tests/pages/components/global-search-box';
import globalSearch from 'ilios/tests/pages/components/global-search';

export default create({
  visit: visitable('/search'),
  paginationLinks: collection('[data-test-pagination-links] button'),
  globalSearch,
  searchBox,
});
