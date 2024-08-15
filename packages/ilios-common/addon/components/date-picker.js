import Component from '@glimmer/component';
import { service } from '@ember/service';
import { isTesting } from '@embroider/macros';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';

export default class DatePickerComponent extends Component {
  @service intl;

  isTesting = isTesting();

  get localeData() {
    const locale = this.intl.primaryLocale;
    let p = 'en';
    if (locale === 'fr') {
      p = import('flatpickr/dist/l10n/fr.js');
    }
    if (locale === 'es') {
      p = import('flatpickr/dist/l10n/es.js');
    }

    return new TrackedAsyncData(p);
  }

  get locale() {
    if (this.localeData.isResolved) {
      return this.localeData.value;
    }

    return 'en';
  }

  get maxDate() {
    return this.args.maxDate ?? null;
  }

  get minDate() {
    return this.args.minDate ?? null;
  }

  @action
  onReady(_selectedDates, _dateStr, flatpickrRef) {
    if (this.args.openOnLoad) {
      flatpickrRef.open();
    }
  }

  @action
  onChange(dates) {
    this.args.onChange(dates[0]);
  }

  @action formatDate(date) {
    return this.intl.formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
