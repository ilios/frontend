import Component from '@ember/component';
import { computed } from '@ember/object';
const { lte } = computed;

export default Component.extend({
  classNames: ['pagedlist-controls'],
  tagName: 'div',
  offset: null,
  limit: null,
  total: null,
  limitless: false,
  start: computed('offset', function(){
    return parseInt(this.get('offset')) + 1;
  }),
  end: computed('offset', 'limit', function(){
    const total = this.get('total');
    let end = parseInt(this.get('offset')) + parseInt(this.get('limit'));
    if(end > total) {
      end = total;
    }

    return end;
  }),
  offsetOptions: computed('total', function(){
    const total = this.get('limitless')?1000:this.get('total');
    const available = [10, 25, 50, 100, 200, 400, 1000];
    let options = available.filter(option => {
      return option < total;
    });
    options.pushObject(available[options.length]);

    return options;
  }),
  lastPage: computed('total', 'limit', 'offset', 'limitless', function(){
    if(this.get('limitless')) {
      return false;
    }

    const total = parseInt(this.get('total'));
    const limit = parseInt(this.get('limit'));
    const offset = parseInt(this.get('offset'));

    return (offset + limit) >= total;
  }),
  firstPage: lte('offset', 0),


  actions: {
    goForward(){
      const offset = this.get('offset');
      const limit = this.get('limit');
      this.sendAction('setOffset', offset+limit);
    },
    goBack(){
      const offset = this.get('offset');
      const limit = this.get('limit');
      this.sendAction('setOffset', offset-limit);
    },
    setOffset(offset){
      const limit = this.get('limit');
      const total = this.get('total');
      const largestOffset = total - limit;
      if (offset < 0) {
        offset = 0;
      }
      if (offset > largestOffset) {
        offset = largestOffset;
      }

      this.sendAction('setOffset', offset);
    },
    setLimit(limit){
      this.sendAction('setLimit', parseInt(limit));
      this.sendAction('setOffset', 0);
    }
  }
});
