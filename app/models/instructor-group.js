import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  ilmSessions: DS.hasMany('ilm-session', {async: true}),
  users: DS.hasMany('user', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  courses: Ember.computed('offerings.[]', 'ilmSessions.[]', function(){
    var defer = Ember.RSVP.defer();
    let promises = [];
    let allCourses = [];
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('offerings').then(offerings => {
        if(!offerings.length){
          resolve();
        }
        let promises = [];
        offerings.forEach(offering => {
          promises.pushObject(offering.get('session').then(session =>{
            return session.get('course').then(course => {
              allCourses.pushObject(course);
            });
          }));
        });
        Ember.RSVP.all(promises).then(()=>{
          resolve();
        });
      });
    }));
    promises.pushObject(new Ember.RSVP.Promise(resolve => {
      this.get('ilmSessions').then(ilmSessions => {
        if(!ilmSessions.length){
          resolve();
        }
        let promises = [];
        ilmSessions.forEach(ilmSession => {
          promises.pushObject(ilmSession.get('session').then(session =>{
            if(!session){
              return;
            }
            return session.get('course').then(course => {
              allCourses.pushObject(course);
            });
          }));
        });
        Ember.RSVP.all(promises).then(()=>{
          resolve();
        });
      });
    }));

    Ember.RSVP.all(promises).then(()=>{
      defer.resolve(allCourses.uniq());
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
});
