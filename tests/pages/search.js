import { create, visitable } from 'ember-cli-page-object';

import globalSearch from './components/global-search';
import paginationLinks from './components/pagination-links';

export default create({
  visit: visitable('/search'),
  paginationLinks,
  globalSearch,
});
