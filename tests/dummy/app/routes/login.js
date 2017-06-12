import Ember from 'ember';
import moment from 'moment';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(UnauthenticatedRouteMixin, {
  beforeModel(){
    const now = moment();
    const nextWeek = now.clone().add(1, 'week');
    const header = '{"alg":"none"}';
    const body = `{"iss": "ilios","aud": "ilios","iat": "${now.format('X')}","exp": "${nextWeek.format('X')}","user_id": 1}`;

    const encodedData =  window.btoa(header) + '.' +  window.btoa(body) + '.';
    const authenticator = 'authenticator:ilios-jwt';
    this.get('session').authenticate(authenticator, {jwt: encodedData});
  }
});
