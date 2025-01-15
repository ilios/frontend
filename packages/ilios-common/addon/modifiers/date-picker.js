import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { isTesting } from '@embroider/macros';
import { service } from '@ember/service';

function cleanup(instance) {
  instance.locale = null;
  instance.onChangeHandler = null;
  if (instance.flatpickr) {
    instance.flatpickr.destroy();
    instance.flatpickr = null;
  }
}

export default class DatePickerModifier extends Modifier {
  @service intl;
  flatpickr = null;
  locale = null;
  onChangeHandler = null;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(element, [value, minDate, maxDate, locale, onChangeHandler]) {
    // We only need to set this once.
    if (!this.onChangeHandler) {
      this.onChangeHandler = onChangeHandler;
    }
    if (!this.flatpickr) {
      this.flatpickr = this.initPicker(element, value, minDate, maxDate, locale);
      this.locale = locale;
    }

    if (this.flatpickr.selectedDates[0] !== value) {
      this.flatpickr.setDate(value);
    }
    if (this.flatpickr.minDate !== minDate) {
      this.flatpickr.set('minDate', minDate);
    }
    if (this.flatpickr.maxDate !== maxDate) {
      this.flatpickr.set('maxDate', maxDate);
    }

    if (this.locale !== locale) {
      this.locale = locale;
      this.flatpickr.set('locale', this.getFlatpickrLocale(locale));
    }
  }

  // @see https://flatpickr.js.org/localization/
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
  async onChange(date) {
    if (this.onChangeHandler) {
      await this.onChangeHandler(date);
    }
  }
}
