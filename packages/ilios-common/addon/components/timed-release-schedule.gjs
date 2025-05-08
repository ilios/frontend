import Component from '@glimmer/component';
import { DateTime } from 'luxon';

export default class TimedReleaseSchedule extends Component {
  get show() {
    return this.showNoSchedule || this.args.endDate || this.startDateInTheFuture;
  }

  get showNoSchedule() {
    if (undefined === this.args.showNoSchedule) {
      return true;
    }
    return this.args.showNoSchedule;
  }

  get startDateInTheFuture() {
    if (!this.args.startDate) {
      return false;
    }
    return DateTime.fromJSDate(new Date(this.args.startDate)) > DateTime.now();
  }
}

{{#if this.show}}
  <span class="timed-release-schedule" data-test-timed-release-schedule>
    {{#if (and @startDate @endDate)}}
      ({{t
        "general.timedReleaseStartAndEndDate"
        startDate=(format-date
          @startDate
          month="2-digit"
          day="2-digit"
          year="numeric"
          hour12=true
          hour="2-digit"
          minute="2-digit"
        )
        endDate=(format-date
          @endDate
          month="2-digit"
          day="2-digit"
          year="numeric"
          hour12=true
          hour="2-digit"
          minute="2-digit"
        )
      }})
    {{/if}}
    {{#if (and @startDate (not @endDate) this.startDateInTheFuture)}}
      ({{t
        "general.timedReleaseOnlyStartDate"
        startDate=(format-date
          @startDate
          month="2-digit"
          day="2-digit"
          year="numeric"
          hour12=true
          hour="2-digit"
          minute="2-digit"
        )
      }})
    {{/if}}
    {{#if (and @endDate (not @startDate))}}
      ({{t
        "general.timedReleaseOnlyEndDate"
        endDate=(format-date
          @endDate
          month="2-digit"
          day="2-digit"
          year="numeric"
          hour12=true
          hour="2-digit"
          minute="2-digit"
        )
      }})
    {{/if}}
    {{#if (and (not @startDate) (not @endDate) this.showNoSchedule)}}
      {{t "general.timedReleaseNoSchedule"}}
    {{/if}}
  </span>
{{/if}}