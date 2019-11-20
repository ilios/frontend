import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
