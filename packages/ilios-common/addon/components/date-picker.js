import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask, restartableTask, waitForProperty } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { later, next } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

export default class DatePickerComponent extends Component {
  @service intl;

  @tracked _flatPickerInstance;
  @tracked isOpen = false;

  updatePicker = restartableTask(async (element, [value]) => {
    await waitForProperty(this, '_flatPickerInstance');
    if (this._flatPickerInstance.selectedDates[0] != value) {
      this._flatPickerInstance.setDate(value);
    }
  });

  setupPicker = dropTask((element) => {
    const currentLocale = this.intl.primaryLocale;
    let locale;
    switch (currentLocale) {
      case 'fr':
        locale = French;
        break;
      case 'es':
        locale = Spanish;
        break;
      default:
        locale = 'en';
    }
    this._flatPickerInstance = flatpickr(element, {
      locale,
      defaultDate: this.args.value,
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
      maxDate: this.args.maxDate ?? null,
      minDate: this.args.minDate ?? null,
      disableMobile: isTesting(),
    });
  });

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
