import Ember from 'ember';
import DS from 'ember-data';

const {computed, inject, RSVP} = Ember;
const {service} = inject;
const {PromiseArray} = DS;

export default Ember.Controller.extend({
  currentUser: service(),
  store: service(),
  textFilter: '',
  limit: 20,
  offset: 0,
  filteredUsers: computed('textFilter', function(){
    let defer = RSVP.defer();
    this.get('currentUser.model').then(user => {
      user.get('school').then(school => {
        if(this.get('textFilter')){
          this.get('store').query('user', {
            q: this.get('textFilter'),
            school: school.get('id'),
            limit: this.get('limit'),
            offset: this.get('offset'),
          }).then(users => {
            defer.resolve(users);
          });
        } else {
          this.get('store').query('user', {
            school: school.get('id'),
            limit: this.get('limit'),
            offset: this.get('offset'),
          }).then(users => {
            defer.resolve(users);
          });
        }
      });
    });
    
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  sortedUsers: computed('filteredUsers.[]', function(){
    return this.get('filteredUsers').sortBy('lastName', 'firstName');
  })
});
