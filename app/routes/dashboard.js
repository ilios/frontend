import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

const { inject, Route, RSVP } = Ember;
const { service } = inject;
const { hash, Promise } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
	i18n: service(),
	currentUser: service(),
	store: service(),
	today: new Date(),

	model() {
		const store = this.get('store');
		return new Promise(resolve => {
			this.get('currentUser.model').then(user => {
				const schools = user.get('schools');
				const academicYears = store.findAll('academic-year');
				resolve(hash({ schools, academicYears }));
			});
		});
		
	},

	setupController() {
    this._super.apply(this, arguments);

		this.controllerFor('application').set('pageTitleTranslation', 'navigation.dashboard');
	}
});
