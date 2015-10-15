import Ember from 'ember';

const {computed, Handlebars} = Ember;
const {SafeString} = Handlebars;
const {collect, sum} = computed;

export default Ember.Component.extend({
  expanded: false,
  classNames: ['big-text'],
  length: 200,
  slippage: 25,
  expandIcon: 'info-circle',
  text: '',
  ellipsis: 'ellipsis-h',
  lengths: collect('length', 'slippage'),
  totalLength: sum('lengths'),
  promptText: '',
  renderHtml: true,
  showIcons: computed('displayText', 'text', function(){
    return false;
    return this.get('displayText') !== this.get('cleanText');
  }),
  textOrPrompt: computed('text', 'promptText', function(){
    let text = this.get('text');
    //give us a string to work with no matter what
    if(text === undefined || text == null){
      text = '';
    }
    
    if(text.length < 1 && this.get('promptText')){
      text = this.get('promptText').toString();
    }
    
    return text;
  }),
  cleanText: computed('textOrPrompt', function(){
    //strip any possible HTML out of the text
    return this.get('textOrPrompt').replace(/(<([^>]+)>)/ig,"");
  }),
  displayText: computed('cleanText', 'totalLength', 'length', 'expanded', function(){
    let cleanText = this.get('cleanText');
    let text;
    if(this.get('expanded') || cleanText.length < this.get('totalLength')){
      if(this.get('renderHtml')){
        text = this.get('textOrPrompt');
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
