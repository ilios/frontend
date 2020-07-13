import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';
import flatpickr from "flatpickr";

export default class CourseRolloverDatePickerComponent extends Component {
  @service intl;

  #flatPickerInstance;

  @dropTask
  *showPicker(element, [course, value]) {
    if (!course) {
      return;
    }
    if (this.#flatPickerInstance) {
      this.#flatPickerInstance.destroy();
    }
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
      defaultDate: value ?? course.startDate,
      formatDate: dateObj => dateObj.toLocaleDateString(currentLocale),
      minDate: course.startDate,
      onChange: ([selectedDate]) => {
        // if a date is forced that isn't allowed
        if (!selectedDate) {
          selectedDate = course.startDate;
        }
        this.args.change(selectedDate);
      },
      "disable": [
        function (date) {
          return course.startDate.getUTCDay() !== date.getUTCDay();
        }
      ],
    });
  }

  willDestroy() {
    this.#flatPickerInstance.destroy();
  }
}
