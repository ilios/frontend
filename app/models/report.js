import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, isPresent, RSVP } = Ember;
const { service }= inject;
const { PromiseObject } = DS;

export default DS.Model.extend({
  i18n: service(),
  title: DS.attr('string'),
  createdAt: DS.attr('date'),
  subject: DS.attr('string'),
  prepositionalObject: DS.attr('string'),
  prepositionalObjectTableRowId: DS.attr('string'),
  user: DS.belongsTo('user', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  displayTitle: computed('title', 'i18n.locale', 'school', function(){
    let defer = RSVP.defer();
    if(isPresent(this.get('title'))){
      defer.resolve(this.get('title'));
    }
    let subject = this.get('subject');
    let prepositionalObject = this.get('prepositionalObject');
    
    this.get('school').then(schoolObj => {
      let school;
      if(schoolObj){
        school = schoolObj.get('title');
      } else {
        school = this.get('i18n').t('general.allSchools');
      }
      if(isPresent(prepositionalObject)){
        let model = prepositionalObject.dasherize();
        if(model === 'instructor'){
          model = 'user';
        }
        if(model === 'mesh-term'){
          model = 'mesh-descriptor';
        }
        this.store.findRecord(model, this.get('prepositionalObjectTableRowId')).then(record => {
          let object;
          if(model === 'user'){
            object = record.get('fullName');
          } else if(model === 'mesh-descriptor'){
            object = record.get('name');
          } else {
            object = record.get('title');
          }
          let displayTitle = this.get('i18n').t('general.reportDisplayTitleWithObject', {
            subject,
            object,
            school
          });
            
          defer.resolve(displayTitle);
        });
      } else {
        let displayTitle = this.get('i18n').t('general.reportDisplayTitleWithoutObject', {
          subject,
          school
        });
        defer.resolve(displayTitle);
      }
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  })
});
