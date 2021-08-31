import { helper } from '@ember/component/helper';
import pcrsUriToNumber from '../utils/pcrs-uri-to-number';

export default helper(function ([uri]) {
  return pcrsUriToNumber(uri);
});
