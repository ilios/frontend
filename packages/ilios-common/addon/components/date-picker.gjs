import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class DatePickerComponent extends Component {
  @service intl;
}

<input
  aria-label={{t "general.pickADate"}}
  class="date-picker"
  data-test-date-picker
  {{date-picker
    @value
    minDate=@minDate
    maxDate=@maxDate
    allowedWeekdays=@allowedWeekdays
    locale=this.intl.primaryLocale
    onChangeHandler=@onChange
  }}
  ...attributes
/>