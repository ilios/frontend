import Ember from 'ember';
import DS from 'ember-data';
import momentFormat from 'ember-moment/computeds/format';

const { Component, computed, inject, RSVP, isEmpty} = Ember;
const { PromiseObject, PromiseArray } = DS;
const { notEmpty } = computed;
const { service } = inject;

export default Component.extend({
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['ilios-event'],
  description: computed('offering.session.description.description', function(){
    let defer = RSVP.defer();
    this.get('thesession').then(session=>{
      session.get('sessionDescription').then(description=>{
        if(isEmpty(description)){
          defer.resolve(null);
        } else {
          defer.resolve(description.get('description'));
        }
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  isOffering: notEmpty('event.offering'),
  niceStartTime: momentFormat('event.startDate', 'dddd, MMMM Do YYYY, h:mm a'),
  offeredAt: computed('niceStartTime', function(){
    return this.get('i18n').t('calendar.offeredAt', {date: this.get('niceStartTime')});
  }),
  instructorList: computed('event.instructors.[]', function(){
    return RSVP.resolve(this.get('event.instructors'));
  }),
  taughtBy: computed('i18n.locale', 'instructorList', function(){
    let defer = RSVP.defer();

    this.get('instructorList').then(instructors => {
      defer.resolve(this.get('i18n').t('calendar.taughtBy', {instructors}));
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  sessionIs: computed('offering.session.sessionType', function(){
    let defer = RSVP.defer();

    this.get('thesession').then(session => {
      session.get('sessionType').then(sessionType => {
        defer.resolve(this.get('i18n').t('calendar.sessionIs', {type: sessionType.get('title')}));
      });
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  offering: computed('event.offering', function(){
    let offeringId = this.get('event.offering');
    if(!offeringId){
      return null;
    }
    return PromiseObject.create({
      promise: this.get('store').findRecord('offering', offeringId)
    });
  }),
  ilmSession: computed('event.ilmSession', function(){
    let ilmSessionId = this.get('event.ilmSession');
    if(!ilmSessionId){
      return null;
    }
    return PromiseObject.create({
      promise: this.get('store').findRecord('ilm-session', ilmSessionId)
    });
  }),
  coursePhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('courses.courseTitle');
  }),
  courseObjectivesPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.courseObjectives');
  }),
  courseLearningMaterialsPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.courseLearningMaterials');
  }),
  courseObjectives: computed('i18n.locale', 'offering.session.course.objectives.@each.topParents.[]', function(){
    let defer = RSVP.defer();

    this.get('thesession').then(session => {
      session.get('course').then(course => {
        course.get('objectives').then(objectives => {
          let promises = [];
          let mappedObjectives = [];
          objectives.forEach(objective => {
            promises.pushObject(objective.get('topParents').then(parents => {
              let parent = parents.get('firstObject');
              promises.pushObject(parent.get('competency').then(competency => {
                //strip all HTML
                let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                if(isEmpty(competency)){
                  mappedObjectives.pushObject({
                    title,
                    domain: this.get('i18n').t('calendar.noAssociatedCompetencies')
                  });
                } else {
                  promises.pushObject(competency.get('domain').then(domain => {
                    mappedObjectives.pushObject({
                      title,
                      domain: competency.get('title') + ' (' + domain.get('title') + ')'
                    });
                  }));
                }
              }));
            }));
          });
          RSVP.all(promises).then(()=>{
            defer.resolve(mappedObjectives);
          });
        });
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  courseLearningMaterials: computed('i18n.locale', function() {
    let defer = Ember.RSVP.defer();

    this.get('thesession').then(session => {
      session.get('course').then(course => {
        this.get('store').query('courseLearningMaterial', {
          filters: {
            course: course.get('id')
          },
          limit: 1000
        }).then((courseLearningMaterials) => {
          let promises = [];
          let mappedLearningMaterials = [];
          courseLearningMaterials.forEach(courseLearningMaterial => {

            promises.pushObject(courseLearningMaterial.get('learningMaterial').then((learningMaterial) => {
              let notes = '';

              if (courseLearningMaterial.get('publicNotes')) {
                notes = courseLearningMaterial.get('notes');
              }

              mappedLearningMaterials.pushObject({
                title: learningMaterial.get('title'),
                description: learningMaterial.get('description'),
                required: courseLearningMaterial.get('required'),
                notes,
                url: learningMaterial.get('url'),
                type: learningMaterial.get('type'),
                mimetype: learningMaterial.get('mimetype'),
                filesize: learningMaterial.get('filesize'),
                citation: learningMaterial.get('citation'),
              });
            }));
          });
          RSVP.all(promises).then(()=>{
            defer.resolve(mappedLearningMaterials);
          });
        });
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  sessionPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('general.session');
  }),
  sessionObjectivesPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.sessionObjectives');
  }),
  sessionLearningMaterialsPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.sessionLearningMaterials');
  }),
  sessionObjectives: computed('i18n.locale', 'offering.session.objectives.@each.topParents.[]', function(){
    let defer = RSVP.defer();

    this.get('thesession').then(session => {
      session.get('objectives').then(objectives => {
        let promises = [];
        let mappedObjectives = [];
        objectives.forEach(objective => {
          promises.pushObject(objective.get('topParents').then(parents => {
            let parent = parents.get('firstObject');
            promises.pushObject(parent.get('competency').then(competency => {
              //strip all HTML
              let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
              if(isEmpty(competency)){
                mappedObjectives.pushObject({
                  title,
                  domain: this.get('i18n').t('calendar.noAssociatedCompetencies')
                });
              } else {
                promises.pushObject(competency.get('domain').then(domain => {
                  mappedObjectives.pushObject({
                    title,
                    domain: competency.get('title') + ' (' + domain.get('title') + ')'
                  });
                }));
              }
            }));
          }));
        });
        RSVP.all(promises).then(()=>{
          defer.resolve(mappedObjectives);
        });
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  sessionLearningMaterials: computed('i18n.locale', function() {
    let defer = Ember.RSVP.defer();

    this.get('thesession').then(session => {
      this.get('store').query('sessionLearningMaterial', {
        filters: {
          session: session.get('id')
        },
        limit: 1000
      }).then((sessionLearningMaterials) => {
        let promises = [];
        let mappedLearningMaterials = [];
        sessionLearningMaterials.forEach(sessionLearningMaterials => {

          promises.pushObject(sessionLearningMaterials.get('learningMaterial').then((learningMaterial) => {
            let notes = '';

            if (sessionLearningMaterials.get('publicNotes')) {
              notes = sessionLearningMaterials.get('notes');
            }

            mappedLearningMaterials.pushObject({
              title: learningMaterial.get('title'),
              description: learningMaterial.get('description'),
              required: sessionLearningMaterials.get('required'),
              notes,
              url: learningMaterial.get('url'),
              type: learningMaterial.get('type'),
              mimetype: learningMaterial.get('mimetype'),
              filesize: learningMaterial.get('filesize'),
              citation: learningMaterial.get('citation'),
            });
          }));
        });
        RSVP.all(promises).then(()=>{
          defer.resolve(mappedLearningMaterials);
        });
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  requiredPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('general.required');
  }),
  course: computed('session.course', function(){
    let defer = RSVP.defer();
    this.get('thesession').then(session=>{
      session.get('course').then(course=>{
        defer.resolve(course);
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  sessionTitle: computed('thesession.title', 'event.isOffering', function(){
    let defer = RSVP.defer();
    let prefix = this.get('isOffering')?'':'ILM: ';
    this.get('thesession').then(session => {
      defer.resolve(prefix + session.get('title'));
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  //session name is already taken by ember-simple-auth
  thesession: computed('offering.session', 'ilmSession.session', function(){
    let defer = RSVP.defer();
    let relationship = this.get('isOffering')?'offering':'ilmSession';
    this.get(relationship).then(related => {
      related.get('session').then(session=>{
        defer.resolve(session);
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
});
