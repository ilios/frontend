import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
  currentUser: Ember.inject.service(),
	model: function() {
		return [
      { id: 1, name: 'Meeting with Joe', startDate: '2015-06-25T14:30', endDate: '2015-06-25T15:30' },
      { id: 2, name: 'Coffee with Susan', startDate: '2015-06-27T16:00', endDate: '2015-06-27T16:30' },
      { id: 3, name: 'Breakfast with Geico', startDate: '2015-06-28T08:30', endDate: '2015-06-28T09:30' },
      { id: 4, name: 'Taxes due', startDate: '2015-06-12T00:00', endDate: '2015-06-12T01:00' }
    ];
	},
	setupController: function(controller, model){
    controller.set('model', model);
    controller.set('currentUser', this.get('currentUser'));
		this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.dashboard'));
	}
});

export default DashboardRoute;
