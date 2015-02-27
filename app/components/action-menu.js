import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  title: '',
  icon: 'gear',
  didInsertElement: function(){
    var element = this.get('element');
    Ember.$(".button", element).click(function(){
      Ember.$(".menu", element).toggleClass("show-menu");
      Ember.$(".menu > li", element).click(function(){
        Ember.$(".button", element).html(Ember.$(this).html());
        Ember.$(".menu", element).removeClass("show-menu");
      });
    });
  }
});
