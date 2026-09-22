import { helper } from '@ember/component/helper';
import { isBlank } from '@ember/utils';
import sortableByPosition from '../utils/sortable-by-position';

export default helper(function sortByPosition([list]) {
  if (isBlank(list)) {
    return [];
  }
  return list.toSorted(sortableByPosition);
});
