import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

const { inject, Route, RSVP } = Ember;
const { service } = inject;
const { hash } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
	i18n: service(),
	currentUser: service(),
	today: new Date(),

	beforeModel() {
		return this.get('currentUser.model');
	},

	model() {
		const user = this.get('currentUser.model');
		const schools = user.get('schools');
		const store = this.store;
		const academicYears = store.findAll('academic-year');

		return hash({ schools, academicYears });
	},

	setupController() {
    this._super.apply(this, arguments);

		this.controllerFor('application').set('pageTitleTranslation', 'navigation.dashboard');
	}
});
