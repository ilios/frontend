/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import Publishable from 'ilios/mixins/publishable';

const { alias } = computed;

export default Component.extend(Publishable, {
  programYear: null,
  classNames: ['programyear-header'],
  publishTarget: alias('programYear'),
  canUpdate: false,
});
