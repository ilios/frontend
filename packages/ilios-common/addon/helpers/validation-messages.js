import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import validationMessages from 'ilios-common/utils/validation-messages';

export default class extends Helper {
  @service intl;

  compute(positional, { description, showAll }) {
    return validationMessages(this.intl, positional[0], { description, showAll }).join(' ').trim();
  }
}
