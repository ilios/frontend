import Ember from 'ember';

const { computed, RSVP } = Ember;
const { Promise } = RSVP;

export default Ember.Component.extend({
  classNames: ['my-profile'],
  user: null,
  roles: computed('user.roles.[]', function(){
    const user = this.get('user');
    return new Promise(resolve => {
      user.get('roles').then(roles => {
        resolve(roles.mapBy('title'));
      });
    })
  }),
});
