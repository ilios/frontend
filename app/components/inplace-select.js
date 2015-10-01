import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-select'],
  selectPromptTranslation: null,
  showSelectPrompt: Ember.computed.notEmpty('selectPromptTranslation'),
  selectPrompt: Ember.computed('i18n.locale', 'selectPromptTranslation', function() {
    return this.get('i18n').t(this.get('selectPromptTranslation'));
  }),
  options: [],
  optionLabelPath: 'title',
  optionValuePath: 'id',
  displayValueOverride: null,
  displayValue: Ember.computed(
    'value',
    'displayValueOverride',
    'displayValueOverride.content',
    'proxiedOptions.[].{value,label}',
    'clickPrompt',
    function(){
    var self = this;
    var displayValue;
    if(this.get('displayValueOverride')){
      return this.get('displayValueOverride');
    }
    if(this.get('value') && this.get('proxiedOptions')){
      let option = this.get('proxiedOptions').find(function(option){
        return option.get('value') === self.get('value');
      });
      if(option){
        displayValue = option.get('label');
      }
    }
    if(!displayValue){
      displayValue = this.get('clickPrompt');
    }

    return displayValue;
  }),
  proxiedOptions: function(){
    var self = this;
    var objectProxy = Ember.ObjectProxy.extend({
      optionValuePath: self.get('optionValuePath'),
      optionLabelPath: self.get('optionLabelPath'),
      value: function(){
        return this.get('content').get(this.get('optionValuePath'));
      }.property('content', 'optionValuePath'),
      label: function(){
        return this.get('content').get(this.get('optionLabelPath'));
      }.property('content', 'optionLabelPath')
    });

    var proxies = this.get('options').map(function(option){
      return objectProxy.create({
        content: option
      });
    });

    return proxies;
  }.property('options.@each', 'optionLabelPath', 'optionValuePath', 'selectPromptTranslation'),

  actions: {
    changeSelection: function(newValue){
      newValue = newValue==='null'?null:newValue;
      this.send('changeValue', newValue);
    }
  }
});
