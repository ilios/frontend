import Ember from 'ember';
import layout from '../templates/components/inplace-select';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  layout: layout,
  tagName: 'span',
  classNames: ['inplace-select'],
  value: null,
  //we use a computed value in case an objecte gets passed in that doesn't yet exist
  // like course.clerkshipType.id when no clerkship type has been set
  computedValue: Ember.computed.oneWay('value'),
  selectPromptTranslation: null,
  clickPromptTranslation: 'general.clickToEdit',
  showSelectPrompt: Ember.computed.notEmpty('selectPromptTranslation'),
  options: [],
  optionLabelPath: 'title',
  optionValuePath: 'id',
  isEditing: false,
  buffer: null,
  displayValue: function(){
    var self = this;
    var displayValue;
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
  }.property('value', 'proxiedOptions.@each.{value,label}', 'clickPrompt'),
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
      this.set('computedValue', newValue);
    },
    edit: function(){
      this.set('buffer', this.get('computedValue'));
      this.set('isEditing', true);
    },
    cancel: function(){
      this.set('computedValue', this.get('buffer'));
      this.set('buffer', null);
      this.set('isEditing', false);
    },
    save: function(){
      this.sendAction('save', this.get('computedValue'));
      this.set('buffer', null);
      this.set('isEditing', false);
    }
  }
});
