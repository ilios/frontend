import Ember from 'ember';
import CurrentUser from '../../mixins/current-user';

export default  Ember.Route.extend(CurrentUser, {
  model: function(){
    return this.store.find('program', {owningSchool: this.modelFor('programs').get('id')});
  }
});
