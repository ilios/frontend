import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';
import flatpickr from "flatpickr";

export default class DatePickerComponent extends Component {
  @service intl;

  #flatPickerInstance;

  @dropTask
  *showPicker(element) {
    const currentLocale = this.intl.locale[0];
    let locale;
    switch (currentLocale) {
    case 'fr':
      // eslint-disable-next-line no-case-declarations
      const { French } = yield import('flatpickr/dist/l10n/fr.js');
      locale = French;
      break;
    case 'es':
      // eslint-disable-next-line no-case-declarations
      const { Spanish } = yield import('flatpickr/dist/l10n/es.js');
      locale = Spanish;
      break;
    default:
      locale = 'en';
    }
    this.#flatPickerInstance = flatpickr(element, {
      locale,
      defaultDate: this.args.value,
      formatDate: dateObj => dateObj.toLocaleDateString(currentLocale),
      onChange: selectedDates => this.args.change(selectedDates[0])
    });
    this.#flatPickerInstance.open();
  }

  willDestroy() {
    this.#flatPickerInstance.destroy();
  }
}
