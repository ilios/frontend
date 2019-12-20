import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { reject } from 'rsvp';
import moment from 'moment';
import Publishable from 'ilios-common/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { oneWay, sort } = computed;

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
  instructionalNotes: [
    validator('length', {
      min: 3,
      max: 65000
    }),
  ],
});

export default Component.extend(Publishable, Validations, ValidationErrorDisplay, {
  currentUser: service(),
  features: service(),
  routing: service('-routing'),
  permissionChecker: service(),
  intl: service(),
  session: null,
  title: null,
  instructionalNotes: null,
  hours: null,
  dueDate: null,
  description: null,
  editable: true,
  sortTypes: null,
  sessionTypes: null,
  sessionType: null,
  showCheckLink: true,
  isSaving: false,
  isEditingPostRequisite: false,
  'data-test-session-overview': true,
  updatedAt: null,
  publishTarget: oneWay('session'),
  sortedSessionTypes: sort('filteredSessionTypes', 'sortTypes'),
  filteredSessionTypes: computed('sessionTypes.[]', function() {
    const selectedSessionType = this.get('sessionType');
    const selectedSessionTypeId = isEmpty(selectedSessionType) ? -1 : selectedSessionType.get('id');
    return this.get('sessionTypes').filter(sessionType => {
      return (sessionType.get('active') || sessionType.get('id') === selectedSessionTypeId);
    });
  }),

  /**
   * Check if a user is allowed to create a session anywhere
   * Try and do this by loading as little data as possible, but in the
   * end we do need to check every course in the school.
   */
  showCopy: computed('currentUser', 'routing.currentRouteName', async function () {
    const permissionChecker = this.get('permissionChecker');
    const routing = this.get('routing');
    if (routing.get('currentRouteName') === 'session.copy') {
      return false;
    }

    const session = this.get('session');
    const course = await session.get('course');
    if (await permissionChecker.canCreateSession(course)) {
      return true;
    }
    const user = await this.currentUser.getModel();
    const allRelatedCourses = await user.get('allRelatedCourses');
    let relatedCourse;
    for (relatedCourse of allRelatedCourses) {
      if (await permissionChecker.canCreateSession(relatedCourse)) {
        return true;
      }
    }
    const school = await course.get('school');
    const schoolCourses = school.get('courses');
    let schoolCourse;
    for (schoolCourse of schoolCourses) {
      if (await permissionChecker.canCreateSession(schoolCourse)) {
        return true;
      }
    }

    return false;
  }),

  school: computed('session.course.school', async function(){
    const session = this.get('session');
    const course = await session.get('course');
    return await course.get('school');
  }),

  showAttendanceRequired: computed('school.configurations.[]', async function(){
    const school = await this.get('school');
    return await school.getConfigValue('showSessionAttendanceRequired');
  }),
  showSupplemental: computed('school.configurations.[]', async function(){
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSupplemental');
  }),
  showSpecialAttireRequired: computed('school.configurations.[]', async function(){
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSpecialAttireRequired');
  }),
  showSpecialEquipmentRequired: computed('school.configurations.[]', async function(){
    const school = await this.get('school');
    return await school.getConfigValue('showSessionSpecialEquipmentRequired');
  }),

  init() {
    this._super(...arguments);
    this.set('sortTypes', ['title']);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('session.title'));
    this.set('instructionalNotes', this.get('session.instructionalNotes'));
    this.get('session.ilmSession').then(ilmSession => {
      if (ilmSession){
        this.set('hours', ilmSession.get('hours'));
        this.set('dueDate', ilmSession.get('dueDate'));
      }
    });
    this.set('updatedAt', moment(this.get('session.updatedAt')).format("L LT"));

    this.get('session.sessionType').then(sessionType => {
      this.set('sessionType', sessionType);
    });

    this.get('session.sessionDescription').then(sessionDescription => {
      if (sessionDescription){
        this.set('description', sessionDescription.get('description'));
      }
    });
  },
  actions: {
    async saveIndependentLearning(value) {
      if (!value) {
        const ilmSession = await this.session.ilmSession;
        this.session.set('ilmSession', null);
        ilmSession.deleteRecord();
        await this.session.save();
        await ilmSession.save();
      } else {
        const hours = 1;
        const dueDate = moment().add(6, 'weeks').toDate();
        this.set('hours', hours);

        var ilmSession = this.get('store').createRecord('ilm-session', {
          session: this.session,
          hours,
          dueDate
        });
        const savedIlmSession = await ilmSession.save();
        this.session.set('ilmSession', savedIlmSession);
        await this.session.save();
      }
    },

    async changeTitle() {
      const { session, title } = this.getProperties('session', 'title');
      this.send('addErrorDisplayFor', 'title');
      const { validations } = await this.validate({ on: ['title'] });

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'title');
        session.set('title', title);
        const newSession = await session.save();
        this.set('title', newSession.title);
        this.set('session', newSession);
      } else {
        await reject();
      }
    },

    revertTitleChanges(){
      const session = this.get('session');
      this.set('title', session.get('title'));
    },
    revertInstructionalNotesChanges(){
      this.set('instructionalNotes', this.session.instructionalNotes);
    },

    setSessionType(id){
      const type = this.get('sessionTypes').findBy('id', id);
      this.set('sessionType', type);
    },

    changeSessionType() {
      const session = this.get('session');
      const type = this.get('sessionType');
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

    async changeIlmHours() {
      const { hours, session } = this.getProperties('hours', 'session');
      this.send('addErrorDisplayFor', 'hours');
      const { validations } = await this.validate({ on: ['hours'] });

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'hours');
        const ilmSession = await session.get('ilmSession');

        if (ilmSession) {
          ilmSession.set('hours', hours);
          await ilmSession.save();
        } else {
          await reject();
        }
      } else {
        await reject();
      }
    },

    revertIlmHoursChanges(){
      this.get('session').get('ilmSession').then(ilmSession => {
        if (ilmSession) {
          this.set('hours', ilmSession.get('hours'));
        }
      });
    },

    async changeIlmDueDate() {
      const { dueDate, session } = this.getProperties('dueDate', 'session');
      this.send('addErrorDisplayFor', 'dueDate');
      const { validations } = await this.validate({ on: ['dueDate'] });

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'dueDate');
        const ilmSession = await session.get('ilmSession');

        if (ilmSession){
          ilmSession.set('dueDate', dueDate);
          await ilmSession.save();
        } else {
          await reject();
        }
      } else {
        await reject();
      }
    },

    revertIlmDueDateChanges(){
      this.get('session').get('ilmSession').then(ilmSession => {
        if (ilmSession) {
          this.set('dueDate', ilmSession.get('dueDate'));
        }
      });
    },

    async saveDescription() {
      const { session, store } = this.getProperties('session', 'store');
      const newDescription = this.description;
      this.send('addErrorDisplayFor', 'description');
      const { validations } = await this.validate({ on: ['description'] });

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'description');
        let sessionDescription = await session.get('sessionDescription');

        if (isEmpty(newDescription) && sessionDescription){
          await sessionDescription.deleteRecord();
        } else {
          if (!sessionDescription) {
            sessionDescription = store.createRecord('session-description');
            sessionDescription.set('session', session);
          }

          sessionDescription.set('description', newDescription);
        }

        this.set('sessionDescription', newDescription);

        if (sessionDescription) {
          await sessionDescription.save();
        }
      } else {
        await reject();
      }
    },

    changeDescription(html){
      this.send('addErrorDisplayFor', 'description');
      const noTagsText = html.replace(/(<([^>]+)>)/ig,"");
      const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

      //if all we have is empty html then save null
      if(strippedText.length === 0){
        html = null;
      }

      this.set('description', html);
    },
    changeInstructionalNotes(html){
      this.send('addErrorDisplayFor', 'instructionalNotes');
      const noTagsText = html.replace(/(<([^>]+)>)/ig,"");
      const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

      //if all we have is empty html then save null
      if(strippedText.length === 0){
        html = null;
      }

      this.set('instructionalNotes', html);
    },
  },
  revertDescriptionChanges: task(function * (){
    const session = this.get('session');
    const sessionDescription = yield session.get('sessionDescription');
    if (sessionDescription) {
      this.set('description', sessionDescription.get('description'));
    } else {
      this.set('description', null);
    }
  }),

  saveInstructionalNotes: task(function* () {
    this.send('addErrorDisplayFor', 'instructionalNotes');
    const { validations } = yield this.validate({ on: ['instructionalNotes'] });
    if (validations.get('isInvalid')) {
      return false;
    }
    this.send('removeErrorDisplayFor', 'instructionalNotes');
    this.session.set('instructionalNotes', this.instructionalNotes);

    yield this.session.save();
    this.set('instructionalNotes', this.session.instructionalNotes);
  }),

});
