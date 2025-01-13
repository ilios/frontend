import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { later, next } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

export default class DatePickerComponent extends Component {
  @service intl;
  @tracked isOpen = false;
  _flatPickerInstance;

  picker = modifier((element, [value, minDate, maxDate, localeIdentifier]) => {
    if (!this._flatPickerInstance) {
      this._flatPickerInstance = this.initPicker(element, value, minDate, maxDate);
    }
    if (this._flatPickerInstance.selectedDates[0] !== value) {
      this._flatPickerInstance.setDate(value);
    }
    if (this._flatPickerInstance.minDate !== minDate) {
      this._flatPickerInstance.set('minDate', minDate);
    }
    if (this._flatPickerInstance.maxDate !== maxDate) {
      this._flatPickerInstance.set('maxDate', maxDate);
    }
    const locale = this.getLocale(localeIdentifier);
    if (this._flatPickerInstance.l10n !== locale) {
      this._flatPickerInstance.set('locale', locale);
    }
  });

  getLocale(localeIdentifier) {
    //console.log(French);
    switch (localeIdentifier) {
      case 'fr':
        return French;
      case 'es':
        return Spanish;
      default:
        return 'en';
    }
  }

  initPicker(element, value, minDate, maxDate, localeIdentifier) {
    const locale = this.getLocale(localeIdentifier);
    return flatpickr(element, {
      locale,
      defaultDate: value,
      formatDate: (dateObj) =>
        this.intl.formatDate(dateObj, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      onChange: (selectedDates) => this.onChange(selectedDates[0]),
      onOpen: () => {
        // eslint-disable-next-line ember/no-runloop
        later(() => {
          this.isOpen = true;
        }, 250);
      },
      onClose: () => {
        this.isOpen = false;
      },
      maxDate: maxDate ?? null,
      minDate: minDate ?? null,
      disableMobile: isTesting(),
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this._flatPickerInstance) {
      this._flatPickerInstance.destroy();
    }
  }

  async onChange(date) {
    await this.args.onChange(date);
    // eslint-disable-next-line ember/no-runloop
    await next(() => {});
  }
}
