/* global moment */
import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

export default Ember.Component.extend(Publishable, {
  session: null,
  publishTarget: Ember.computed.oneWay('session'),
  publishEventCollectionName: 'sessions',
  editable: true,
  classNames: ['session-overview'],
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortTypes'),
  showCheckLink: true,
  actions: {
    saveIndependentLearning: function(value){
      var session = this.get('session');
      if(!value){
        session.get('ilmSessionFacet').then(function(ilmSession){
          session.set('ilmSessionFacet', null);
          ilmSession.deleteRecord();
          session.save();
          ilmSession.save();
        });
      } else {
        var ilmSession = this.get('store').createRecord('ilm-session', {
          session: session,
          hours: 1,
          dueDate: moment().add(6, 'weeks').toDate()
        });
        ilmSession.save().then(function(savedIlmSession){
          session.set('ilmSessionFacet', savedIlmSession);
          session.save();
        });
      }
    },
    changeTitle: function(value){
      this.get('session').set('title', value);
      this.get('session').save();
    },
    changeSessionType: function(newId){
      var session = this.get('session');
      var type = this.get('sessionTypes').findBy('id', newId);
      session.set('clerkshipType', type);
      type.get('sessions').then(function(sessions){
        sessions.addObject(session);
        session.save();
        sessions.save();
      });
    },
    changeSupplemental: function(value){
      this.get('session').set('supplemental', value);
      this.get('session').save();
    },
    changeSpecialEquipment: function(value){
      this.get('session').set('equipmentRequired', value);
      this.get('session').save();
    },
    changeSpecialAttire: function(value){
      this.get('session').set('attireRequired', value);
      this.get('session').save();
    },
    changeIlmHours: function(value){
      this.get('session.ilmSessionFacet').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('hours', value);
          ilmSession.save();
        }
      });
    },
    changeIlmDueDate: function(value){
      this.get('session.ilmSessionFacet').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('dueDate', value);
          ilmSession.save();
        }
      });
    },
    changeDescription: function(value){
      var self = this;
      this.get('session.sessionDescription').then(function(sessionDescription){
        if(!sessionDescription){
          sessionDescription = self.get('store').createRecord('session-description');
        }
        sessionDescription.set('description', value);
        sessionDescription.save().then(function(returnedDescription){
          self.get('session').set('sessionDescription', returnedDescription);
          self.get('session').save();
        });
      });
    },
  }
});
