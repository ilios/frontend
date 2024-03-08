import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { DateTime } from 'luxon';
import { task, timeout } from 'ember-concurrency';

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
    const midnightToday = DateTime.fromObject({
      hour: 23,
      minute: 59,
      second: 59,
    });
    const twoWeeksFromNow = midnightToday.plus({ weeks: 2 });
    const oneYearFromNow = midnightToday.plus({ years: 1 });
    this.minDate = midnightToday.toJSDate();
    this.maxDate = oneYearFromNow.toJSDate();
    this.expiresAt = twoWeeksFromNow.toJSDate();
    this.generatedJwt = null;
  }

  createNewToken = task(async () => {
    await timeout(10); //small delay to allow rendering the spinner
    const expiresAt = DateTime.fromJSDate(this.expiresAt).set({ hour: 23, minute: 59, second: 59 });
    const now = DateTime.now();
    const days = expiresAt.diff(now, 'days').toFormat('dd');

    const hours = DateTime.fromObject({ hour: 23 }).diff(now, 'hours').toFormat('hh');
    const minutes = DateTime.fromObject({ minute: 59 }).diff(now, 'minutes').toFormat('mm');
    const seconds = DateTime.fromObject({ second: 59 }).diff(now, 'seconds').toFormat('ss');

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
