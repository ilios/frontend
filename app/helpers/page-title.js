import { helper } from '@ember/component/helper';

/*
 * This is a noop helper because the LTI shouldn't mess with the page title, but
 * common includes {{page-title}} references.
 */
export default helper(function pageTitle() {
  return '';
});
