import { create, visitable } from 'ember-cli-page-object';

import searchBox from 'ilios/tests/pages/components/global-search-box';
import globalSearch from 'ilios/tests/pages/components/global-search';
import paginationLinks from 'ilios/tests/pages/components/pagination-links';

export default create({
  visit: visitable('/search'),
  paginationLinks,
  globalSearch,
  searchBox,
});
