import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'tr',
  status: function(){
    return Ember.I18n.t('general.notPublished');
  }.property()
});
