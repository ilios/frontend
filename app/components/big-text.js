import Ember from 'ember';

const { Component, computed, Handlebars } = Ember;
const { SafeString } = Handlebars;
const { collect, sum } = computed;

export default Component.extend({
  expanded: false,
  classNames: ['big-text'],
  length: 200,
  slippage: 25,
  expandIcon: 'info-circle',
  text: '',
  ellipsis: 'ellipsis-h',
  lengths: collect('length', 'slippage'),
  totalLength: sum('lengths'),
  renderHtml: true,
  showIcons: computed('displayText', 'text', 'renderHtml', function(){
    if(this.get('renderHtml')){
      return this.get('displayText').toString() !== this.get('text');
    } else {
      return this.get('displayText').toString() !== this.get('cleanText');
    }
  }),
  cleanText: computed('text', function(){
    //strip any possible HTML out of the text
    return this.get('text').replace(/(<([^>]+)>)/ig,"");
  }),
  displayText: computed('cleanText', 'totalLength', 'length', 'expanded', function(){
    let cleanText = this.get('cleanText');
    let text;
    if(this.get('expanded') || cleanText.length < this.get('totalLength')){
      if(this.get('renderHtml')){
        text = this.get('text');
      } else {
        text = cleanText;
      }
    } else {
      text = cleanText.substring(0, this.get('length'));
    }

    return new SafeString(text);

  }),
  actions: {
    click: function(){
      this.sendAction();
    },
    expand: function(){
      this.set('expanded', true);
    }
  }
});
