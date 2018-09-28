import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { next } from '@ember/runloop';
import layout from '../templates/components/sessions-grid-header';

export default Component.extend({
  layout,
  classNames: ['sessions-grid-header'],
  isExpanding: false,
  'data-test-sessions-grid-header': true,
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    setSortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  },
  expandAll: task(function * () {
    this.set('isExpanding', true);
    yield timeout(100);
    this.toggleExpandAll();
    // we need to wait for the browser to hand back
    //control and then swap the icon back
    yield next(() => {
      this.set('isExpanding', false);
    });
  }).drop()
});
