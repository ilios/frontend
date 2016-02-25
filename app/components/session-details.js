import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  sessionTypes: [],
  session: null,
  editable: not('course.locked'),
  sessionObjectiveDetails: null,
  sessionTaxonomyDetails: null,

  didInsertElement: function(){
    scrollTo("#session-" + this.get('session.id'));
  },
  actions: {
    save: function(){
      var self = this;
      var  session = this.get('session');
      session.save().then(function(session){
        if(!self.get('isDestroyed')){
          self.set('session', session);
        }
      });
    },
    toggleSessionObjectiveDetails(){
      this.sendAction('toggleSessionObjectiveDetails');
    },
    toggleSessionTaxonomyDetails(){
      this.sendAction('toggleSessionTaxonomyDetails');
    },
  }
});
