import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask, waitForProperty } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import flatpickr from 'flatpickr';
import { later } from '@ember/runloop';
import { isTesting } from '@embroider/macros';
import { next } from '@ember/runloop';

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

  setupPicker = dropTask(async (element) => {
    const currentLocale = this.intl.locale[0];
    let locale;
    switch (currentLocale) {
      case 'fr':
        // eslint-disable-next-line no-case-declarations
        const { French } = await import('flatpickr/dist/l10n/fr.js');
        locale = French;
        break;
      case 'es':
        // eslint-disable-next-line no-case-declarations
        const { Spanish } = await import('flatpickr/dist/l10n/es.js');
        locale = Spanish;
        break;
      default:
        locale = 'en';
    }
    this._flatPickerInstance = flatpickr(element, {
      locale,
      defaultDate: this.args.value,
      formatDate: (dateObj) => this.intl.formatDate(dateObj),
      onChange: (selectedDates) => this.onChange(selectedDates[0]),
      onOpen: () => {
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
    await next(() => {});
  }
}
