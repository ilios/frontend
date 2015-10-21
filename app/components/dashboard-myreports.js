import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  tagName: 'div',
  classNames: ['dashboard-block'],
  sortedReports: Ember.computed('currentUser.model.reports.[]', function(){
    let defer = Ember.RSVP.defer();
    this.get('currentUser').get('model').then( user => {
      user.get('reports').then( reports => {
        defer.resolve(reports.sortBy('title'));
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    toggleEditor() {
      this.set('myReportEditorOn', !this.get('myReportEditorOn'));
    },

    closeEditor() {
      this.set('myReportEditorOn', false);
    }
  }
});
