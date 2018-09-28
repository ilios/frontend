import Component from '@ember/component';
import layout from '../templates/components/loading-spinner';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['loading-spinner']
});
