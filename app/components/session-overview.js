import moment from 'moment';
import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

const { Component, computed } = Ember;
const { oneWay, sort } = computed;

export default Component.extend(Publishable, {
  session: null,
  publishTarget: oneWay('session'),
  editable: true,
  classNames: ['session-overview'],
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: sort('sessionTypes', 'sortTypes'),
  showCheckLink: true,

  titleValidations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  hoursValidations: {
    'validationBuffer': {
      presence: true,
      numericality: { greaterThan: 0 }
    }
  },

  actions: {
    saveIndependentLearning: function(value){
      var session = this.get('session');
      if(!value){
        session.get('ilmSession').then(function(ilmSession){
          session.set('ilmSession', null);
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
          session.set('ilmSession', savedIlmSession);
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
      session.set('sessionType', type);
      session.save();
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
      this.get('session.ilmSession').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('hours', value);
          ilmSession.save();
        }
      });
    },
    changeIlmDueDate: function(value){
      this.get('session.ilmSession').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('dueDate', value);
          ilmSession.save();
        }
      });
    },
    changeDescription: function(value){
      this.get('session.sessionDescription').then(sessionDescription => {
        if(!value && sessionDescription){
          sessionDescription.deleteRecord();
          sessionDescription.save();
        } else {
          if(!sessionDescription){
            sessionDescription = this.get('store').createRecord('session-description');
            sessionDescription.set('session', this.get('session'));
          }
          sessionDescription.set('description', value);
          sessionDescription.save().then(returnedDescription => {
            this.get('session').set('sessionDescription', returnedDescription);
            this.get('session').save();
          });
        }
      });
    },
  }
});
