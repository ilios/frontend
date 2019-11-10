import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { padStart } from 'ember-pad/utils/pad';

export default Component.extend({
  fetch: service(),
  flashMessages: service(),
  iliosConfig: service(),
  session: service(),

  classNames: ['my-profile'],

  expiresAt: null,
  generatedJwt: null,
  maxDate: null,
  minDate: null,
  user: null,

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  apiDocsUrl: computed('host', 'namespace', function() {
    let apiPath = '/' + this.namespace;
    let host = this.host?this.host:window.location.protocol + '//' + window.location.host;
    let docPath = host + apiPath.replace('v1', 'doc');
    return docPath;
  }),

  init() {
    this._super(...arguments);
    this.reset();
  },

  actions: {
    nothing() {
      //noop action to pass to profile components
    },

    tokenCopied() {
      const flashMessages = this.flashMessages;
      flashMessages.success('general.copiedSuccessfully');
    },

    reset() {
      this.reset();
    },

    selectExpiresAtDate(selectedDate) {
      this.set('expiresAt', selectedDate);
    }
  },

  reset() {
    let midnightToday = moment().hour(23).minute(59).second(59);
    let twoWeeksFromNow = midnightToday.clone().add(2, 'weeks');
    let oneYearFromNow = midnightToday.clone().add(1, 'year');
    this.set('minDate', midnightToday.toDate());
    this.set('maxDate', oneYearFromNow.toDate());
    this.set('expiresAt', twoWeeksFromNow.toDate());
    this.set('generatedJwt', null);
  },

  createNewToken: task(function* () {
    yield timeout(10); //small delay to allow rendering the spinner
    let selection = this.expiresAt;
    let expiresAt = moment(selection).hour(23).minute(59).second(59);
    const now = moment();
    const days = padStart(expiresAt.diff(now, 'days'), 2, '0');

    const hours = padStart(moment().hours(23).diff(now, 'hours'), 2, '0');
    const minutes = padStart(moment().minutes(59).diff(now, 'minutes'), 2, '0');
    const seconds = padStart(moment().seconds(59).diff(now, 'seconds'), 2, '0');

    let interval = `P${days}DT${hours}H${minutes}M${seconds}S`;

    let url = '/auth/token?ttl=' + interval;
    let data = yield this.fetch.getJsonFromApiHost(url);
    this.set('generatedJwt', data.jwt);
  }),

  invalidateTokens: task(function* () {
    yield timeout(10); //small delay to allow rendering the spinner
    let url = '/auth/invalidatetokens';
    let data = yield this.fetch.getJsonFromApiHost(url);

    if (isPresent(data.jwt)) {
      const flashMessages = this.flashMessages;
      const session = this.session;
      let authenticator = 'authenticator:ilios-jwt';
      session.authenticate(authenticator, {jwt: data.jwt});
      flashMessages.success('general.successfullyInvalidatedTokens');
      this.toggleShowInvalidateTokens();
    }
  })
});
