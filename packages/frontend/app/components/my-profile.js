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
    await timeout(1); //small delay to allow rendering the spinner

    //set the expiration time to the end of the day
    const expiresAt = DateTime.fromJSDate(this.expiresAt).set({ hour: 23, minute: 59, second: 59 });
    //calculate the difference between now and the expiration time, and round each unit down (so we don't get secionds like 31.123)
    const diff = expiresAt.diffNow(['days', 'hours', 'minutes', 'seconds']).mapUnits(Math.floor);
    //Use Luxon's ISO format to get a string like "P1DT2H3M4S" which is 1 day, 2 hours, 3 minutes, and 4 seconds
    const interval = diff.toISO();

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
