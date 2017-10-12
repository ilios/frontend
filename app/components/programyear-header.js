import Component from '@ember/component';
import { computed } from '@ember/object';
import Publishable from 'ilios/mixins/publishable';

const { alias, not } = computed;

export default Component.extend(Publishable, {
  programYear: null,
  classNames: ['programyear-header'],
  publishTarget: alias('programYear'),
  editable: not('programYear.locked'),
});
