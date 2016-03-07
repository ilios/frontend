import moment from 'moment';
import DS from 'ember-data';
import Ember from 'ember';
import PublishableModel from 'ilios/mixins/publishable-model';
import CategorizableModel from 'ilios/mixins/categorizable-model';

const { computed, RSVP } = Ember;
const { filterBy, mapBy, sum } = computed;
const { Promise } = RSVP;
const { Model, PromiseArray } = DS;

export default Model.extend(PublishableModel, CategorizableModel, {
  title: DS.attr('string'),
  level: DS.attr('number'),
  year: DS.attr('number'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  externalId: DS.attr('string'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  clerkshipType: DS.belongsTo('course-clerkship-type', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  cohorts: DS.hasMany('cohort', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
  learningMaterials: DS.hasMany('course-learning-material', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  academicYear: computed('year', function(){
    return this.get('year') + ' - ' + (parseInt(this.get('year')) + 1);
  }),
  competencies: computed('objectives.@each.treeCompetencies', function(){
    let promise = new Promise(resolve => {
      this.get('objectives').then(function(objectives){
        var promises = objectives.getEach('treeCompetencies');
        Ember.RSVP.all(promises).then(function(trees){
          var competencies = trees.reduce(function(array, set){
            return array.pushObjects(set.toArray());
          }, []);
          competencies = competencies.uniq().filter(function(item){
            return item != null;
          });
          resolve(competencies);
        });
      });
    });

    return PromiseArray.create({
      promise: promise
    });
  }),
  domains: computed('competencies.@each.domain', function(){
    let defer = RSVP.defer();
    let domainContainer = {};
    let domainIds = [];
    let promises = [];
    this.get('competencies').forEach(function(competency){
      promises.pushObject(competency.get('domain').then(
        domain => {
          if(!domainContainer.hasOwnProperty(domain.get('id'))){
            domainIds.pushObject(domain.get('id'));
            domainContainer[domain.get('id')] = Ember.ObjectProxy.create({
              content: domain,
              subCompetencies: []
            });
          }
          if(competency.get('id') !== domain.get('id')){
            let subCompetencies = domainContainer[domain.get('id')].get('subCompetencies');
            if(!subCompetencies.contains(competency)){
              subCompetencies.pushObject(competency);
              subCompetencies.sortBy('title');
            }
          }
        }
      ));
    });
    RSVP.all(promises).then(function(){
      let domains = domainIds.map(function(id){
        return domainContainer[id];
      }).sortBy('title');
      defer.resolve(domains);
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  publishedSessions: filterBy('sessions', 'isPublished'),
  publishedSessionOfferings: mapBy('publishedSessions', 'offerings'),
  publishedSessionOfferingCounts: mapBy('publishedSessionOfferings', 'length'),
  publishedOfferingCount: sum('publishedSessionOfferingCounts'),
  setDatesBasedOnYear: function(){
    let today = moment();
    let firstDayOfYear = moment(this.get('year') + '-7-1', "YYYY-MM-DD");
    let startDate = today < firstDayOfYear?firstDayOfYear:today;
    let endDate = moment(startDate).add('8', 'weeks');
    this.set('startDate', startDate.toDate());
    this.set('endDate', endDate.toDate());
  },
  requiredPublicationSetFields: ['startDate', 'endDate'],
  requiredPublicationLengthFields: ['cohorts'],
  optionalPublicationSetFields: [],
  optionalPublicationLengthFields: ['terms', 'objectives', 'meshDescriptors'],
  requiredPublicationIssues: computed('startDate', 'endDate', 'cohorts.length', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'terms.length',
    'objectives.length',
    'meshDescriptors.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),
  associatedLearnerGroups: computed('sessions.[].associatedLearnerGroups.[]', function(){
    let deferred = Ember.RSVP.defer();
    this.get('sessions').then(function(sessions){
      RSVP.all(sessions.mapBy('associatedLearnerGroups')).then(function(sessionLearnerGroups){
        let allGroups = [].concat.apply([],sessionLearnerGroups);
        let groups = allGroups?allGroups.uniq().sortBy('title'):[];
        deferred.resolve(groups);
      });
    });

    return PromiseArray.create({
      promise: deferred.promise
    });
  }),

  /**
   * All schools associated with this course.
   * This includes the course-owning school, as well as schools owning associated cohorts.
   * @property schools
   * @type {Ember.computed}
   * @public
   */
  schools: computed('school', 'cohorts.[]', function() {
    let schools = [];
    let promises = [];

    // get course-owning school
    let promise = new Promise(resolve => {
      this.get('school').then(school => {
        schools.pushObject(school);
        resolve();
      });

    });
    promises.pushObject(promise);

    // get schools from associated cohorts
    promise = new Ember.RSVP.Promise(resolve => {
      this.get('cohorts').then(cohorts => {
        RSVP.map(cohorts.mapBy('programYear'), programYear => {
          return programYear.get('program').then(program => {
            return program.get('school').then(school => {
              schools.pushObject(school);
            });
          });
        }).then(() => {
          resolve();
        });
      });
    });
    promises.pushObject(promise);

    // once the two promises above resolve,
    // dedupe all schools and return a promise-array containing the dupe-free list of schools.
    let deferred = Ember.RSVP.defer();
    RSVP.all(promises).then(() => {
      let s = schools.uniq();
      deferred.resolve(s);
    });

    return PromiseArray.create({
      promise: deferred.promise
    });
  }),

  /**
   * All vocabularies that are eligible for assignment to this course.
   * @property assignableVocabularies
   * @type {Ember.computed}
   * @public
   */
  assignableVocabularies: computed('schools.@each.vocabularies', function() {
    let deferred = Ember.RSVP.defer();
    this.get('schools').then(function (schools) {
      RSVP.all(schools.mapBy('vocabularies')).then(function (schoolVocabs) {
        let v = [];
        schoolVocabs.forEach(vocabs => {
          vocabs.forEach(vocab => {
            v.pushObject(vocab);
          })
        });
        v = v.sortBy('school.title', 'title');
        deferred.resolve(v);
      });
    });
    return PromiseArray.create({
      promise: deferred.promise
    });
  }),
});
