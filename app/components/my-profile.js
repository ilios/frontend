import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import pad from 'pad';

export default class MyProfileComponent extends Component {
  @service fetch;
  @service flashMessages;
  @service iliosConfig;
  @service session;

  @tracked expiresAt = null;
  @tracked generatedJwt = null;
  @tracked maxDate = null;
  @tracked minDate = null;

  get apiDocsLink() {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const host = this.iliosConfig.host
      ? this.iliosConfig.host
      : window.location.protocol + '//' + window.location.host;
    const docPath = host + apiPath.replace('v3', 'doc');
    return `<a href="${docPath}">${docPath}</a>`;
  }

  constructor() {
    super(...arguments);
    this.reset();
  }

  @action
  tokenCopied() {
    this.flashMessages.success('general.copiedSuccessfully');
  }

  @action
  selectExpiresAtDate(selectedDate) {
    this.expiresAt = selectedDate;
  }

  @action
  reset() {
    const midnightToday = moment().hour(23).minute(59).second(59);
    const twoWeeksFromNow = midnightToday.clone().add(2, 'weeks');
    const oneYearFromNow = midnightToday.clone().add(1, 'year');
    this.minDate = midnightToday.toDate();
    this.maxDate = oneYearFromNow.toDate();
    this.expiresAt = twoWeeksFromNow.toDate();
    this.generatedJwt = null;
  }

  createNewToken = task(async () => {
    await timeout(10); //small delay to allow rendering the spinner
    const selection = this.expiresAt;
    const expiresAt = moment(selection).hour(23).minute(59).second(59);
    const now = moment();
    const days = pad(2, expiresAt.diff(now, 'days'), '0');

    const hours = pad(2, moment().hours(23).diff(now, 'hours'), '0');
    const minutes = pad(2, moment().minutes(59).diff(now, 'minutes'), '0');
    const seconds = pad(2, moment().seconds(59).diff(now, 'seconds'), '0');

    const interval = `P${days}DT${hours}H${minutes}M${seconds}S`;

    const url = '/auth/token?ttl=' + interval;
    const data = await this.fetch.getJsonFromApiHost(url);
    this.generatedJwt = data.jwt;
  });

  invalidateTokens = task(async () => {
    await timeout(10); //small delay to allow rendering the spinner
    const url = '/auth/invalidatetokens';
    const data = await this.fetch.getJsonFromApiHost(url);

    if (isPresent(data.jwt)) {
      const flashMessages = this.flashMessages;
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      session.authenticate(authenticator, { jwt: data.jwt });
      flashMessages.success('general.successfullyInvalidatedTokens');
      this.args.toggleShowInvalidateTokens();
    }
  });
}
