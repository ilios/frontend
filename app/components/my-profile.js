import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { padStart } from 'ember-pad/utils/pad';

const { computed, RSVP, isPresent } = Ember;
const { Promise } = RSVP;
const { reads } = computed;


export default Ember.Component.extend({
  init(){
    this._super(...arguments);
    this.reset();
  },
  reset(){
    let midnightToday = moment().hour(23).minute(59).second(59);
    let twoWeeksFromNow = midnightToday.clone().add(2, 'weeks');
    let oneYearFromNow = midnightToday.clone().add(1, 'year');
    this.set('minDate', midnightToday.toDate());
    this.set('maxDate', oneYearFromNow.toDate());
    this.set('expiresAt', twoWeeksFromNow.toDate());
    this.set('generatedJwt', null);
  },
  iliosConfig: Ember.inject.service(),
  commonAjax: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  session: Ember.inject.service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  expiresAt: null,
  maxDate: null,
  minDate: null,
  generatedJwt: null,

  classNames: ['my-profile'],
  user: null,
  roles: computed('user.roles.[]', function(){
    const user = this.get('user');
    return new Promise(resolve => {
      user.get('roles').then(roles => {
        resolve(roles.mapBy('title'));
      });
    });
  }),
  apiDocsUrl: computed('host', 'namespace', function(){
    let apiPath = '/' + this.get('namespace');
    let host = this.get('host')?this.get('host'):window.location.protocol + '//' + window.location.host;
    let docPath = host + apiPath.replace('v1', 'doc');

    return docPath;
  }),
  createNewToken: task(function * (){
    yield timeout(10); //small delay to allow rendering the spinner
    let selection = this.get('expiresAt');
    let expiresAt = moment(selection).hour(23).minute(59).second(59);
    const now = moment();
    const days = padStart(expiresAt.diff(now, 'days'), 2, '0');

    const hours = padStart(moment().hours(23).diff(now, 'hours'), 2, '0');
    const minutes = padStart(moment().minutes(59).diff(now, 'minutes'), 2, '0');
    const seconds = padStart(moment().seconds(59).diff(now, 'seconds'), 2, '0');

    let interval = `P${days}DT${hours}H${minutes}M${seconds}S`;

    const commonAjax = this.get('commonAjax');
    let url = '/auth/token?ttl=' + interval;
    let data = yield commonAjax.request(url);

    this.set('generatedJwt', data.jwt);
  }),
  invalidateTokens: task(function * (){
    yield timeout(10); //small delay to allow rendering the spinner
    const commonAjax = this.get('commonAjax');
    let url = '/auth/invalidatetokens';
    let data = yield commonAjax.request(url);

    if (isPresent(data.jwt)) {
      const flashMessages = this.get('flashMessages');
      const session = this.get('session');
      let authenticator = 'authenticator:ilios-jwt';
      session.authenticate(authenticator, {jwt: data.jwt});
      flashMessages.success('general.successfullyInvalidatedTokens');
      this.get('toggleShowInvalidateTokens')();
    }
  }),
  actions: {
    tokenCopied(){
      const flashMessages = this.get('flashMessages');
      flashMessages.success('general.copiedSuccessfully');
    },
    reset(){
      this.reset();
    },
    selectExpiresAtDate(selectedDate){
      this.set('expiresAt', selectedDate);
    }
  }
});
