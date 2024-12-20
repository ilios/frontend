import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import flatpickr from 'flatpickr';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later, next } from '@ember/runloop';
import { isTesting } from '@embroider/macros';
import { DateTime } from 'luxon';

export default class CourseRolloverDatePickerComponent extends Component {
  @service intl;
  @tracked isOpen;

  #flatPickerInstance;

  showPicker = dropTask(async (course, value, element) => {
    if (!course) {
      return;
    }
    if (this.#flatPickerInstance) {
      this.#flatPickerInstance.destroy();
    }
    const currentLocale = this.intl.primaryLocale;
    const courseDT = DateTime.fromJSDate(course.startDate);
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
      onChange: ([selectedDate]) => this.onChange(selectedDate),
      onOpen: () => {
        // eslint-disable-next-line ember/no-runloop
        later(() => {
          this.isOpen = true;
        }, 250);
      },
      onClose: () => {
        this.isOpen = false;
      },
      disable: [
        function (date) {
          return DateTime.fromJSDate(date).weekday !== courseDT.weekday;
        },
      ],
      disableMobile: isTesting(),
    });
  });

  @action
  close() {
    if (this.#flatPickerInstance) {
      this.#flatPickerInstance.close();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.#flatPickerInstance) {
      this.#flatPickerInstance.destroy();
    }
  }

  async onChange(date) {
    // if a date is forced that isn't allowed
    if (!date) {
      date = this.args.course.startDate;
    }
    await this.args.onChange(date);
    // eslint-disable-next-line ember/no-runloop
    await next(() => {});
  }
}
