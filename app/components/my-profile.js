/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { padStart } from 'ember-pad/utils/pad';

const { Promise } = RSVP;
const { reads } = computed;


export default Component.extend({
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
  iliosConfig: service(),
  commonAjax: service(),
  flashMessages: service(),
  session: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  expiresAt: null,
  maxDate: null,
  minDate: null,
  generatedJwt: null,

  classNames: ['my-profile'],
  user: null,
  roles: computed('user.roles.[]', function(){
    const user = this.user;
    return new Promise(resolve => {
      user.get('roles').then(roles => {
        resolve(roles.mapBy('title'));
      });
    });
  }),
  apiDocsUrl: computed('host', 'namespace', function(){
    let apiPath = '/' + this.namespace;
    let host = this.host?this.host:window.location.protocol + '//' + window.location.host;
    let docPath = host + apiPath.replace('v1', 'doc');

    return docPath;
  }),
  createNewToken: task(function * (){
    yield timeout(10); //small delay to allow rendering the spinner
    let selection = this.expiresAt;
    let expiresAt = moment(selection).hour(23).minute(59).second(59);
    const now = moment();
    const days = padStart(expiresAt.diff(now, 'days'), 2, '0');

    const hours = padStart(moment().hours(23).diff(now, 'hours'), 2, '0');
    const minutes = padStart(moment().minutes(59).diff(now, 'minutes'), 2, '0');
    const seconds = padStart(moment().seconds(59).diff(now, 'seconds'), 2, '0');

    let interval = `P${days}DT${hours}H${minutes}M${seconds}S`;

    const commonAjax = this.commonAjax;
    let url = '/auth/token?ttl=' + interval;
    let data = yield commonAjax.request(url);

    this.set('generatedJwt', data.jwt);
  }),
  invalidateTokens: task(function * (){
    yield timeout(10); //small delay to allow rendering the spinner
    const commonAjax = this.commonAjax;
    let url = '/auth/invalidatetokens';
    let data = yield commonAjax.request(url);

    if (isPresent(data.jwt)) {
      const flashMessages = this.flashMessages;
      const session = this.session;
      let authenticator = 'authenticator:ilios-jwt';
      session.authenticate(authenticator, {jwt: data.jwt});
      flashMessages.success('general.successfullyInvalidatedTokens');
      this.toggleShowInvalidateTokens();
    }
  }),
  actions: {
    nothing() {
      //noop action to pass to profile components
    },
    tokenCopied(){
      const flashMessages = this.flashMessages;
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
