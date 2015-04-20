import Ember from 'ember';

export default Ember.Component.extend({
  expanded: false,
  classNames: ['big-text'],
  length: 200,
  slippage: 25,
  expandIcon: 'info-circle',
  text: '',
  ellipsis: 'ellipsis-h',
  lengths: Ember.computed.collect('length', 'slippage'),
  totalLength: Ember.computed.sum('lengths'),
  promptText: '',
  showIcons: function(){
    return this.get('displayText') !== this.get('cleanText');
  }.property('displayText', 'text'),
  cleanText: function(){
    var text = this.get('text');
    if(text === undefined || text == null){
      return this.get('promptText');
    }
    //strip any possible HTML out of the text
    return text.replace(/(<([^>]+)>)/ig,"");
  }.property('text'),
  displayText: function(){
    var text = this.get('cleanText');
    if(this.get('expanded') || text.length < this.get('totalLength')){
      return text;
    }

    return text.substring(0, this.get('length'));
  }.property('cleanText', 'totalLength', 'length', 'expanded'),
  actions: {
    click: function(){
      this.sendAction();
    },
    expand: function(){
      this.set('expanded', true);
    }
  }
});
