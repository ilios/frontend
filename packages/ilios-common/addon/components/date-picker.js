import Component from '@glimmer/component';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { next } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

export default class DatePickerComponent extends Component {
  @service intl;
  #flatPickerInstance;
  #locale;

  picker = modifier((element, [value, minDate, maxDate, locale]) => {
    if (!this.#flatPickerInstance) {
      this.#flatPickerInstance = this.initPicker(element, value, minDate, maxDate, locale);
      this.#locale = locale;
    }
    if (this.#flatPickerInstance.selectedDates[0] !== value) {
      this.#flatPickerInstance.setDate(value);
    }
    if (this.#flatPickerInstance.minDate !== minDate) {
      this.#flatPickerInstance.set('minDate', minDate);
    }
    if (this.#flatPickerInstance.maxDate !== maxDate) {
      this.#flatPickerInstance.set('maxDate', maxDate);
    }
    if (this.#locale !== locale) {
      this.#locale = locale;
      this.#flatPickerInstance.set('locale', this.getFlatpickrLocale(locale));
    }
  });

  getFlatpickrLocale(localeIdentifier) {
    switch (localeIdentifier) {
      case 'fr':
        return French;
      case 'es':
        return Spanish;
      default:
        return 'en';
    }
  }

  initPicker(element, value, minDate, maxDate, locale) {
    return flatpickr(element, {
      locale: this.getFlatpickrLocale(locale),
      defaultDate: value,
      formatDate: (dateObj) =>
        this.intl.formatDate(dateObj, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      onChange: (selectedDates) => this.onChange(selectedDates[0]),
      maxDate: maxDate ?? null,
      minDate: minDate ?? null,
      disableMobile: isTesting(),
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.#locale = null;
    if (this.#flatPickerInstance) {
      this.#flatPickerInstance.destroy();
    }
  }

  async onChange(date) {
    await this.args.onChange(date);
    // eslint-disable-next-line ember/no-runloop
    await next(() => {});
  }
}
