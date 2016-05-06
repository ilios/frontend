import Ember from 'ember';
import { Ability } from 'ember-can';

const { inject, computed } = Ember;
const { service } = inject;
const { alias } = computed;

export default Ability.extend({
  currentUser: service(),
  canView: alias('currentUser.canViewCurriculumInventory'),
  canEdit: alias('currentUser.canEditCurriculumInventory'),
});
