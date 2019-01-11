import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/week-glance-pre-work';

export default Component.extend({
  layout,
  router: service(),
  tagName: ''
});
