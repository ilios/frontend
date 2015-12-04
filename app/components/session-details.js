import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component } = Ember;

export default Component.extend({
  sessionTypes: [],
  session: null,
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
    }
  }

});
