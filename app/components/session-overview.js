import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';
import Publishable from 'ilios/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, RSVP } = Ember;
const { oneWay, sort } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
  hours: [
    validator('presence', true),
    validator('number', {
      allowString: true,
      integer: true,
      gt: 0
    }),
  ],
});

export default Component.extend(Publishable, Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('session.title'));
  },
  session: null,
  title: null,
  publishTarget: oneWay('session'),
  editable: true,
  classNames: ['session-overview'],
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: sort('sessionTypes', 'sortTypes'),
  showCheckLink: true,
  isSaving: false,

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
    changeTitle(){
      const title = this.get('title');
      const session = this.get('session');
      this.send('addErrorDisplayFor', 'title');
      return new Promise((resolve, reject) => {
        this.validate({ on: ['title'] }).then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'title');
            session.set('title', title);
            session.save().then((newSession) => {
              this.set('title', newSession.get('title'));
              this.set('session', newSession);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges(){
      const session = this.get('session');
      this.set('title', session.get('title'));
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
