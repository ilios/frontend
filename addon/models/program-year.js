import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios-common/mixins/publishable-model';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';


const { computed, ObjectProxy, RSVP } = Ember;
const { alias } = computed;
const { Promise, all } = RSVP;

export default DS.Model.extend(PublishableModel, CategorizableModel, SortableByPosition, {
  startYear: DS.attr('string'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  program: DS.belongsTo('program', {async: true}),
  cohort: DS.belongsTo('cohort', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
  academicYear: computed('startYear', function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'))+1);
  }),
  classOfYear: computed('startYear', 'program.duration', function(){
    return (parseInt(this.get('startYear'))+parseInt(this.get('program.duration')));
  }),
  requiredPublicationIssues: computed('startYear', 'cohort', 'program', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'directors.length',
    'competencies.length',
    'terms.length',
    'objectives.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),
  requiredPublicationSetFields: ['startYear', 'cohort', 'program'],
  optionalPublicationLengthFields: ['directors', 'competencies', 'terms', 'objectives'],

  /**
   * All top-level competencies ("domains"), along with their sub-competencies, associated with this program-year.
   *
   * @property competencyDomains
   * @type {Ember.computed}
   * @public
   */
  competencyDomains: computed('competencies.@each.domain', async function() {
    let promises = [];
    let domainContainer = {};
    let domainIds = [];
    const competencies = await this.get('competencies');

    competencies.forEach(competency => {
      promises.pushObject(competency.get('domain').then(domain => {
        if(!domainContainer.hasOwnProperty(domain.get('id'))){
          domainIds.pushObject(domain.get('id'));
          domainContainer[domain.get('id')] = ObjectProxy.create({
            content: domain,
            subCompetencies: []
          });
        }
        if(competency.get('id') !== domain.get('id')){
          let subCompetencies = domainContainer[domain.get('id')].get('subCompetencies');
          if(!subCompetencies.includes(competency)){
            subCompetencies.pushObject(competency);
          }
        }
      }));
    });

    await all(promises);
    return domainIds.map(id => {
      return domainContainer[id];
    }).sortBy('title');
  }),

  /**
   * @property domains
   * @public
   * @type {Ember.computed}
   * @deprecated Use competencyDomains instead. [ST 2017/08/31]
   */
  domains: computed('competencies.@each.domain', function(){
    Ember.deprecate('Use competencyDomains instead.');
    var defer = Ember.RSVP.defer();
    var domainContainer = {};
    var domainIds = [];
    var promises = [];
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
            var subCompetencies = domainContainer[domain.get('id')].get('subCompetencies');
            if(!subCompetencies.includes(competency)){
              subCompetencies.pushObject(competency);
              subCompetencies.sortBy('title');
            }
          }
        }
      ));
    });
    Ember.RSVP.all(promises).then(function(){
      var domains = domainIds.map(function(id){
        return domainContainer[id];
      }).sortBy('title');
      defer.resolve(domains);
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  assignableVocabularies: alias('program.school.vocabularies'),

  /**
   * A list of program-year objectives, sorted by position and title.
   * @property sortedObjectives
   * @type {Ember.computed}
   */
  sortedObjectives: computed('objectives.@each.position', 'objectives.@each.title', function() {
    return new Promise(resolve => {
      this.get('objectives').then(objectives => {
        resolve(objectives.toArray().sort(this.positionSortingCallback));
      });
    });
  })
});
