import Component from '@ember/component';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import {
  Promise as RSVPPromise,
  filter,
  hash,
  map
} from 'rsvp';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_DELAY = 600;

const Validations = buildValidations({
  room: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 255
    }),
  ],
  numberOfWeeks: {
    dependentKeys: ['model.makeRecurring'],
    disabled: not('model.makeRecurring'),
    validators: [
      validator('presence', {
        presence: true
      }),
      validator('number', {
        allowString: true,
        integer: true,
        gt: 0,
      }),
    ]
  },
  durationHours: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 0
    })
  ],
  durationMinutes: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 0,
      lte: 59
    })
  ],
  learnerGroups: {
    dependentKeys: ['model.smallGroupMode'],
    disabled: not('model.smallGroupMode'),
    validators: [
      validator('length', {
        min: 1,
        messageKey: 'general.smallGroupMessage'
      })
    ]
  }
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  currentUser: service(),
  timezone: service(),

  classNames: ['offering-form'],

  currentTimezone: null,
  isEditingTimezone: false,
  timezones: null,
  startDate: null,
  endDate: null,
  room: 'TBD',
  cohorts: null,
  learnerGroups: null,
  showRoom: false,
  showMakeRecurring: false,
  showInstructors: false,
  showOfferingCalendar: false,
  makeRecurring: false,
  recurringDays: null,
  numberOfWeeks: 1,
  instructors: null,
  instructorGroups: null,
  courseStartDate: null,
  courseEndDate: null,
  smallGroupMode: false,
  offeringsToSave: 0,
  savedOfferings: 0,
  recurringDayOptions: null,
  loaded: false,
  'data-test-offering-form': true,

  associatedSchools: computed('cohorts.[]', function(){
    return new RSVPPromise(resolve => {
      const cohorts = this.get('cohorts');
      if (isEmpty(cohorts)) {
        resolve([]);
      } else {
        map(cohorts.toArray(), cohort => {
          return cohort.get('school');
        }).then(cohortSchools => {
          const schools = [];
          schools.pushObjects(cohortSchools);
          resolve(schools.uniq().toArray());
        });
      }
    });
  }),
  availableInstructorGroups: computed('associatedSchools.[]', function(){
    return new RSVPPromise(resolve => {
      this.get('associatedSchools').then(associatedSchools => {
        map(associatedSchools, school => {
          return school.get('instructorGroups');
        }).then(allInstructorGropus => {
          const flat = allInstructorGropus.reduce((flattened, obj) => {
            return flattened.pushObjects(obj.toArray());
          }, []);

          resolve(flat);
        });
      });
    });
  }),
  defaultStartDate: computed('courseStartDate', 'courseEndDate', function(){
    const today = moment();
    const courseStartDate = this.get('courseStartDate');
    const courseEndDate = this.get('courseEndDate');
    let defaultStartDate = today.clone();
    if (isPresent(courseStartDate) && today.isBefore(courseStartDate)) {
      defaultStartDate = moment(courseStartDate);
    }
    if (isPresent(courseEndDate) && today.isAfter(courseEndDate)) {
      defaultStartDate = moment(courseEndDate);
    }

    return defaultStartDate.toDate();
  }),
  durationHours: computed('startDate', 'endDate', function(){
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');

    if (isEmpty(startDate) || isEmpty(endDate)) {
      return 1;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);
    const diffInHours = mEnd.diff(mStart, 'hours');

    return diffInHours;
  }),
  durationMinutes: computed('startDate', 'endDate', function(){
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');

    if (isEmpty(startDate) || isEmpty(endDate)) {
      return 0;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);

    const endHour = mEnd.hour();
    const endMinute = mEnd.minute();

    mStart.hour(endHour);
    const startMinute = mStart.minute();

    let diff = 0;
    if (endMinute > startMinute) {
      diff = endMinute - startMinute;
    } else if (endMinute < startMinute) {
      diff = (60 - startMinute) + endMinute;
    }
    return diff;
  }),

  formattedCurrentTimezone: computed('currentTimezone', function() {
    return this.timezone.formatTimezone(this.currentTimezone);
  }),

  lowestLearnerGroupLeaves: computed('learnerGroups.[]', function(){
    const learnerGroups = this.get('learnerGroups');
    const ids = learnerGroups.mapBy('id');
    return new RSVPPromise(resolve => {
      filter(learnerGroups, group => {
        return new RSVPPromise(resolve => {
          group.get('allDescendants').then(children => {
            const selectedChildren = children.filter(child => ids.includes(child.get('id')));
            resolve(selectedChildren.length === 0);
          });
        });
      }).then(lowestLeaves => resolve(lowestLeaves));
    });
  }),
  init(){
    this._super(...arguments);

    this.set('currentTimezone', this.timezone.getCurrentTimezone());
    this.set('timezones', this.timezone.getTimezones());

    this.set('recurringDayOptions', [
      {day: '0', t: 'general.sunday'},
      {day: '1', t: 'general.monday'},
      {day: '2', t: 'general.tuesday'},
      {day: '3', t: 'general.wednesday'},
      {day: '4', t: 'general.thursday'},
      {day: '5', t: 'general.friday'},
      {day: '6', t: 'general.saturday'},
    ]);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    const offering = this.get('offering');
    if (isPresent(offering)) {
      this.get('loadAttrsFromOffering').perform(offering);
    } else {
      this.loadDefaultAttrs();
    }
  },

  actions: {
    addLearnerGroup(learnerGroup) {
      const learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.addObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.addObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    },
    removeLearnerGroup(learnerGroup) {
      const learnerGroups = this.get('learnerGroups').toArray();
      learnerGroups.removeObject(learnerGroup);
      learnerGroup.get('allDescendants').then(function(descendants){
        learnerGroups.removeObjects(descendants);
      });
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('learnerGroups', learnerGroups);
    },
    toggleRecurringDay(day){
      const recurringDays = this.get('recurringDays');
      if (recurringDays.includes(day)) {
        recurringDays.removeObject(day);
      } else {
        recurringDays.pushObject(day);
      }
    },
    addInstructor(user){
      const instructors = this.get('instructors').toArray();
      instructors.addObject(user);
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('instructors', instructors);
    },
    addInstructorGroup(group){
      const instructorGroups = this.get('instructorGroups').toArray();
      instructorGroups.addObject(group);
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('instructorGroups', instructorGroups);
    },
    removeInstructor(user){
      const instructors = this.get('instructors').toArray();
      instructors.removeObject(user);
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('instructors', instructors);
    },
    removeInstructorGroup(group){
      const instructorGroups = this.get('instructorGroups').toArray();
      instructorGroups.removeObject(group);
      //re-create the object so we trigger downstream didReceiveAttrs
      this.set('instructorGroups', instructorGroups);
    },
    updateStartTime(value, type) {
      const startDate = moment(this.get('startDate'));

      if (type === 'hour') {
        startDate.hour(value);
      } else {
        startDate.minute(value);
      }
      const minutes = this.get('durationMinutes');
      const hours = this.get('durationHours');
      const endDate = startDate.clone().add(hours, 'hours').add(minutes, 'minutes');

      this.set('startDate', startDate.toDate());
      this.set('endDate', endDate.toDate());
    },
    updateStartDate(date) {
      const minutes = this.get('durationMinutes');
      const hours = this.get('durationHours');
      const currentStartDate = moment(this.get('startDate'));
      const startDate = moment(date).hour(currentStartDate.hour()).minute(currentStartDate.minute()).toDate();
      const endDate = moment(startDate).add(hours, 'hours').add(minutes, 'minutes').toDate();

      this.setProperties({startDate, endDate});
    },

    changeTimezone(value) {
      this.set('currentTimezone', value);
      this.set('isEditingTimezone', false);
    },
  },

  makeRecurringOfferingObjects: task(function * () {
    const {
      startDate,
      endDate,
      room,
      instructorGroups,
      instructors,
      numberOfWeeks,
      recurringDays
    } = this.getProperties('startDate', 'endDate', 'room', 'instructorGroups', 'instructors', 'numberOfWeeks', 'recurringDays');
    const makeRecurring = this.get('makeRecurring');
    const learnerGroups = yield this.get('lowestLearnerGroupLeaves');
    const offerings = [];
    offerings.push({startDate, endDate, room, learnerGroups, instructorGroups, instructors});
    if (!makeRecurring) {
      return offerings;
    }

    const userPickedDay = moment(startDate).day();
    //convert strings to numbers use parseFloat because parseInt takes a second
    //argument and gets thrown off by map sending that argument as the counter
    const recurringDayInts = recurringDays.map(parseFloat).sort();

    // Add offerings for the rest of first week
    //only days AFTER the initial day are considered
    recurringDayInts.forEach(day => {
      if (day > userPickedDay) {
        const obj = {room, learnerGroups, instructorGroups, instructors};
        obj.startDate = moment(startDate).day(day).toDate();
        obj.endDate = moment(endDate).day(day).toDate();

        offerings.push(obj);
      }
    });
    recurringDayInts.pushObject(userPickedDay);
    recurringDayInts.sort();

    for (let i = 1; i < numberOfWeeks; i++) {
      recurringDayInts.forEach(day => {
        const obj = {room, learnerGroups, instructorGroups, instructors};
        obj.startDate = moment(startDate).day(day).add(i, 'weeks').toDate();
        obj.endDate = moment(endDate).day(day).add(i, 'weeks').toDate();

        offerings.push(obj);
      });
    }

    return offerings;
  }),
  makeSmallGroupOfferingObjects: task(function * (offerings){
    const smallGroupMode = this.get('smallGroupMode');
    if (!smallGroupMode) {
      return offerings;
    }

    const smallGroupOfferings = [];

    for (let i = 0; i < offerings.length; i++) {
      const { startDate, endDate, learnerGroups } = offerings[i];
      let { room } = offerings[i];
      for (let j = 0; j < learnerGroups.length; j++) {
        const learnerGroup = learnerGroups[j];
        const defaultLocation = learnerGroup.get('location');
        if (isPresent(defaultLocation)) {
          room = defaultLocation;
        }
        const instructors = yield learnerGroup.get('instructors');
        const instructorGroups = yield learnerGroup.get('instructorGroups');
        const offering = {startDate, endDate, room, instructorGroups, instructors};
        offering.learnerGroups = [learnerGroup];

        smallGroupOfferings.pushObject(offering);
      }
    }

    return smallGroupOfferings;
  }),


  loadDefaultAttrs() {
    let loaded = this.get('loaded');
    if (loaded) {
      return;
    }
    const startDate = moment(this.get('defaultStartDate')).hour(8).minute(0).second(0).toDate();
    const endDate = moment(this.get('defaultStartDate')).hour(9).minute(0).second(0).toDate();
    const room = 'TBD';
    const learnerGroups = [];
    const recurringDays = [];
    const instructors = [];
    const instructorGroups = [];
    loaded = true;

    this.setProperties({startDate, endDate, room, learnerGroups, recurringDays, instructors, instructorGroups, loaded});
  },

  loadAttrsFromOffering: task(function * (offering) {
    let loaded = this.get('loaded');
    if (loaded) {
      return;
    }
    const startDate = offering.get('startDate');
    const endDate = offering.get('endDate');
    const room = offering.get('room');
    const recurringDays = [];
    const obj = yield hash({
      learnerGroups : offering.get('learnerGroups'),
      instructors : offering.get('instructors'),
      instructorGroups : offering.get('instructorGroups'),
    });
    const learnerGroups = obj.learnerGroups.toArray();
    const instructors = obj.instructors.toArray();
    const instructorGroups = obj.instructorGroups.toArray();
    loaded = true;

    this.setProperties({startDate, endDate, room, learnerGroups, recurringDays, instructors, instructorGroups, loaded});
  }).drop(),

  saveOffering: task(function * () {
    this.set('offeringsToSave', 0);
    this.set('savedOfferings', 0);
    this.send('addErrorDisplaysFor', ['room', 'numberOfWeeks', 'durationHours', 'durationMinutes', 'learnerGroups']);
    yield timeout(10);
    const {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }
    let offerings = yield this.get('makeRecurringOfferingObjects').perform();
    offerings = yield this.get('makeSmallGroupOfferingObjects').perform(offerings);

    // adjust timezone
    offerings.forEach(offering => {
      offering.startDate = moment.tz(
        moment(offering.startDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone).toDate();
      offering.endDate = moment.tz(
        moment(offering.endDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone).toDate();
    });

    this.set('offeringsToSave', offerings.length);
    //save offerings in sets of 5
    let parts;
    while (offerings.length > 0){
      parts = offerings.splice(0, 5);
      yield map(parts, ({startDate, endDate, room, learnerGroups, instructorGroups, instructors}) => {
        return this.get('save')(startDate, endDate, room, learnerGroups, instructorGroups, instructors);
      });
      this.set('savedOfferings', this.get('savedOfferings') + parts.length);
    }
    this.send('clearErrorDisplay');
    this.get('close')();
  }),

  validateThenSaveOffering: task(function * () {
    this.send('addErrorDisplaysFor', ['room', 'numberOfWeeks', 'durationHours', 'durationMinutes', 'learnerGroups']);
    const {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }

    yield this.get('saveOffering').perform();
  }),

  updateDurationHours: task(function * (hours) {
    yield timeout(DEBOUNCE_DELAY);
    this.send('addErrorDisplayFor', 'durationHours');
    const minutes = this.durationMinutes;
    const endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
    this.set('endDate', endDate);
  }).restartable(),

  updateDurationMinutes: task(function * (minutes) {
    yield timeout(DEBOUNCE_DELAY);
    this.send('addErrorDisplayFor', 'durationMinutes');
    const hours = this.durationHours;
    const endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
    this.set('endDate', endDate);
  }).restartable(),

});
