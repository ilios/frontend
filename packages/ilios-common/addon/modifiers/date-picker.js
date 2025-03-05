import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { isTesting } from '@embroider/macros';
import { service } from '@ember/service';
import { DateTime } from 'luxon';

export default class DatePickerModifier extends Modifier {
  @service intl;
  flatpickr = null;
  locale = null;
  minDate = null;
  maxDate = null;
  onChangeHandler = null;
  allowedWeekdays = [];

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, () => {
      this.locale = null;
      this.onChangeHandler = null;
      if (this.flatpickr) {
        this.flatpickr.destroy();
        this.flatpickr = null;
      }
    });
  }

  modify(element, [value], { minDate, maxDate, allowedWeekdays, locale, onChangeHandler }) {
    // We only need to set this once.
    if (!this.onChangeHandler) {
      this.onChangeHandler = onChangeHandler;
    }

    if (Array.isArray(allowedWeekdays)) {
      this.allowedWeekdays = allowedWeekdays;
    } else {
      this.allowedWeekdays = [];
    }

    if (this.flatpickr) {
      if (
        this.minDate !== (minDate ?? null) &&
        new Date(this.minDate).getTime() !== new Date(minDate).getTime()
      ) {
        this.minDate = minDate;
        this.flatpickr.set('minDate', minDate);
      }

      if (
        this.maxDate !== (maxDate ?? null) &&
        new Date(this.maxDate).getTime() !== new Date(maxDate).getTime()
      ) {
        this.maxDate = maxDate;
        this.flatpickr.set('maxDate', maxDate);
      }

      if (
        this.flatpickr.selectedDates[0] !== value &&
        new Date(this.flatpickr.selectedDates[0]).getTime() !== new Date(value).getTime()
      ) {
        this.flatpickr.setDate(value);
      }

      if (locale && this.locale !== locale) {
        this.locale = locale;
        this.flatpickr.set('locale', this.getFlatpickrLocale(locale));
      }
    } else {
      this.minDate = minDate ?? null;
      this.maxDate = maxDate ?? null;
      this.locale = locale ?? this.intl.primaryLocale;
      this.flatpickr = this.initPicker(element, value, this.minDate, this.maxDate, this.locale);
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
      disable: [
        // If a list of allowed weekdays is given,
        // then disable all dates that don't fall on these weekdays.
        (date) => {
          if (this.allowedWeekdays.length) {
            return !this.allowedWeekdays.includes(DateTime.fromJSDate(date).weekday);
          }
          return false;
        },
      ],
    });
  }

  async onChange(date) {
    if (this.onChangeHandler) {
      await this.onChangeHandler(date);
    }
  }
}
