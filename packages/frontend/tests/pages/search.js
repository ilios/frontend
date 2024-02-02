import { create, visitable } from 'ember-cli-page-object';

import globalSearch from 'frontend/tests/pages/components/global-search';
import paginationLinks from 'frontend/tests/pages/components/pagination-links';

export default create({
  visit: visitable('/search'),
  paginationLinks,
  globalSearch,
});
