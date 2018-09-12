import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SessionRouteMixin from 'ilios-common/mixins/session-route';

export default Route.extend(AuthenticatedRouteMixin, SessionRouteMixin, {
});
