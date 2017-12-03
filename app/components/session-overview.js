/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import Publishable from 'ilios/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import config from '../config/environment';

const { IliosFeatures: { schoolSessionAttributes } } = config;
const { oneWay, sort } = computed;
const { Promise, all } = RSVP;

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
      positive: true,
    }),
  ],
  dueDate: [
    validator('presence', true),
  ],
  description: [
    validator('length', {
      min: 3,
      max: 65000
    }),
  ],
});

export default Component.extend(Publishable, Validations, ValidationErrorDisplay, {
  currentUser: service(),
  routing: service('-routing'),
  init() {
    this._super(...arguments);
    this.set('sortTypes', ['title']);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('session.title'));
    this.get('session.ilmSession').then(ilmSession => {
      if (ilmSession){
        this.set('hours', ilmSession.get('hours'));
        this.set('dueDate', ilmSession.get('dueDate'));
      }
    });

    this.get('session.sessionType').then(sessionType => {
      this.set('sessionType', sessionType);
    });

    this.get('session.sessionDescription').then(sessionDescription => {
      if (sessionDescription){
        this.set('description', sessionDescription.get('description'));
      }
    });
  },
  session: null,
  title: null,
  hours: null,
  dueDate: null,
  description: null,
  publishTarget: oneWay('session'),
  editable: true,
  sortTypes: null,
  sessionTypes: null,
  sessionType: null,
  sortedSessionTypes: sort('filteredSessionTypes', 'sortTypes'),
  showCheckLink: true,
  isSaving: false,

  filteredSessionTypes: computed('sessionTypes.[]', function() {
    const selectedSessionType = this.get('sessionType');
    const selectedSessionTypeId = isEmpty(selectedSessionType) ? -1 : selectedSessionType.get('id');
    return this.get('sessionTypes').filter(sessionType => {
      return (sessionType.get('active') || sessionType.get('id') === selectedSessionTypeId);
    });
  }),

  showCopy: computed('currentUser', 'routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      if (routing.get('currentRouteName') === 'session.copy') {
        resolve(false);
      } else {
        const currentUser = this.get('currentUser');
        all([
          currentUser.get('userIsCourseDirector'),
          currentUser.get('userIsDeveloper')
        ]).then(hasRole => {
          resolve(hasRole.includes(true));
        });
      }

    });
  }),

  school: computed('session.course.school', async function(){
    const session = this.get('session');
    const course = await session.get('course');
    return await course.get('school');
  }),

  showAttendanceRequired: computed('school.configurations.[]', async function(){
    if (!schoolSessionAttributes) {
      return false;
    }
    const school = await this.get('school');
    return await school.getConfigValue('showSessionAttendanceRequired');
  }),
  showSupplemental: computed('school.configurations.[]', async function(){
    if (!schoolSessionAttributes) {
      return true;
    }
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSupplemental');
  }),
  showSpecialAttireRequired: computed('school.configurations.[]', async function(){
    if (!schoolSessionAttributes) {
      return true;
    }
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSpecialAttireRequired');
  }),
  showSpecialEquipmentRequired: computed('school.configurations.[]', async function(){
    if (!schoolSessionAttributes) {
      return true;
    }
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSpecialEquipmentRequired');
  }),

  actions: {
    saveIndependentLearning(value) {
      var session = this.get('session');
      if(!value){
        session.get('ilmSession').then(function(ilmSession){
          session.set('ilmSession', null);
          ilmSession.deleteRecord();
          session.save();
          ilmSession.save();
        });
      } else {
        const hours = 1;
        const dueDate = moment().add(6, 'weeks').toDate();
        this.set('hours', hours);

        var ilmSession = this.get('store').createRecord('ilm-session', {
          session,
          hours,
          dueDate
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

    setSessionType(id){
      let type = this.get('sessionTypes').findBy('id', id);
      this.set('sessionType', type);
    },

    changeSessionType() {
      let session = this.get('session');
      let type = this.get('sessionType');
      session.set('sessionType', type);
      session.save();
    },

    revertSessionTypeChanges() {
      this.get('session').get('sessionType').then(sessionType => {
        this.set('sessionType', sessionType);
      });
    },
    changeSupplemental(value) {
      this.get('session').set('supplemental', value);
      this.get('session').save();
    },
    changeSpecialEquipment(value) {
      this.get('session').set('equipmentRequired', value);
      this.get('session').save();
    },
    changeSpecialAttire(value) {
      this.get('session').set('attireRequired', value);
      this.get('session').save();
    },
    changeAttendanceRequired(value) {
      this.get('session').set('attendanceRequired', value);
      this.get('session').save();
    },
    changeIlmHours() {
      const newHours = this.get('hours');
      const session = this.get('session');
      this.send('addErrorDisplayFor', 'hours');
      return new Promise((resolve, reject) => {
        this.validate({ on: ['hours'] }).then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'hours');
            session.get('ilmSession').then(function(ilmSession){
              if(ilmSession){
                ilmSession.set('hours', newHours);
                resolve(ilmSession.save());
              } else {
                reject();
              }
            });
          } else {
            reject();
          }
        });
      });
    },
    revertIlmHoursChanges(){
      this.get('session').get('ilmSession').then(ilmSession => {
        if (ilmSession) {
          this.set('hours', ilmSession.get('hours'));
        }
      });
    },
    changeIlmDueDate() {
      const newDueDate = this.get('dueDate');
      const session = this.get('session');
      this.send('addErrorDisplayFor', 'dueDate');
      return new Promise((resolve, reject) => {
        this.validate({ on: ['dueDate'] }).then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'dueDate');
            session.get('ilmSession').then(function(ilmSession){
              if(ilmSession){
                ilmSession.set('dueDate', newDueDate);
                resolve(ilmSession.save());
              } else {
                reject();
              }
            });
          } else {
            reject();
          }
        });
      });
    },
    revertIlmDueDateChanges(){
      this.get('session').get('ilmSession').then(ilmSession => {
        if (ilmSession) {
          this.set('dueDate', ilmSession.get('dueDate'));
        }
      });
    },
    saveDescription() {
      const session = this.get('session');
      const store = this.get('store');
      const newDescription = this.get('description');

      this.send('addErrorDisplayFor', 'description');
      return new Promise((resolve, reject) => {
        this.validate({ on: ['description'] }).then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'description');
            session.get('sessionDescription').then(sessionDescription => {
              if(isEmpty(newDescription) && sessionDescription){
                sessionDescription.deleteRecord();
              } else {
                if(!sessionDescription){
                  sessionDescription = store.createRecord('session-description');
                  sessionDescription.set('session', session);
                }
                sessionDescription.set('description', newDescription);
              }
              this.set('sessionDescription', newDescription);
              if (sessionDescription) {
                resolve(sessionDescription.save());
              } else {
                resolve();
              }
            });
          } else {
            reject();
          }
        });
      });


    },
    changeDescription(html){
      this.send('addErrorDisplayFor', 'description');
      let noTagsText = html.replace(/(<([^>]+)>)/ig,"");
      let strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

      //if all we have is empty html then save null
      if(strippedText.length === 0){
        html = null;
      }

      this.set('description', html);
    },
    revertDescriptionChanges(){
      this.get('session').get('sessionDescription').then(sessionDescription => {
        if (sessionDescription) {
          this.set('description', sessionDescription.get('description'));
        }
      });
    },
  }
});
