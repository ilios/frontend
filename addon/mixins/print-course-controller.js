import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  currentUser: service(),
  queryParams: ['unpublished'],
  unpublished: false,
  canViewUnpublished: false,
});
