import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import flatpickr from 'flatpickr';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

export default class CourseRolloverDatePickerComponent extends Component {
  @service intl;
  @tracked isOpen;

  #flatPickerInstance;

  showPicker = dropTask(async (element, [course, value]) => {
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
    this.#flatPickerInstance = flatpickr(element, {
      locale,
      defaultDate: value ?? course.startDate,
      formatDate: (dateObj) => this.intl.formatDate(dateObj),
      minDate: course.startDate,
      onChange: ([selectedDate]) => {
        // if a date is forced that isn't allowed
        if (!selectedDate) {
          selectedDate = course.startDate;
        }
        this.args.onChange(selectedDate);
      },
      onOpen: () => {
        later(() => {
          this.isOpen = true;
        }, 250);
      },
      onClose: () => {
        this.isOpen = false;
      },
      disable: [
        function (date) {
          return course.startDate.getUTCDay() !== date.getUTCDay();
        },
      ],
      disableMobile: isTesting(),
    });
  });

  @action
  close() {
    this?.#flatPickerInstance.close();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.#flatPickerInstance.destroy();
  }
}
