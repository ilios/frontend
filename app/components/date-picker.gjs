import Component from '@glimmer/component';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import datePicker from 'ilios-common/modifiers/date-picker';
import focus from 'ilios-common/modifiers/focus';

export default class DatePickerComponent extends Component {
  @service intl;
  <template>
    <input
      aria-label={{t "general.pickADate"}}
      class="date-picker"
      data-test-date-picker
      {{datePicker
        @value
        minDate=@minDate
        maxDate=@maxDate
        allowedWeekdays=@allowedWeekdays
        locale=this.intl.primaryLocale
        onChangeHandler=@onChange
      }}
      {{focus @autofocus}}
      ...attributes
    />
  </template>
}
