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
  displayTitle: computed('title', 'i18n.locale', function(){
    let defer = RSVP.defer();
    if(isPresent(this.get('title'))){
      defer.resolve(this.get('title'));
    }
    let subject = this.get('subject');
    let prepositionalObject = this.get('prepositionalObject');
    if(isPresent(prepositionalObject)){
      let model = prepositionalObject.dasherize();
      if(model === 'instructor'){
        model = 'user';
      }
      this.store.findRecord(model, this.get('prepositionalObjectTableRowId')).then(record => {
        let object;
        if(model === 'user'){
          object = record.get('fullName');
        } else if(model === 'mesh-term'){
          object = record.get('name');
        } else {
          object = record.get('title');
        }
        
        let displayTitle = this.get('i18n').t('dashboard.reportDisplayTitleWithObject', {
          subject,
          object
        });
        
        defer.resolve(displayTitle);
      });
    } else {
      let displayTitle = this.get('i18n').t('dashboard.reportDisplayTitleWithoutObject', {
        subject
      });
      
      defer.resolve(displayTitle);
    }
    
    
    return PromiseObject.create({
      promise: defer.promise
    });
  })
});
