import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validatable, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import t from 'ember-intl/helpers/t';
import EditableField from 'ilios-common/components/editable-field';
import formatDate from 'ember-intl/helpers/format-date';
import perform from 'ember-concurrency/helpers/perform';
import DatePicker from 'ilios-common/components/date-picker';
import TimePicker from 'ilios-common/components/time-picker';
import ValidationError from 'ilios-common/components/validation-error';

@validatable
export default class SessionOverviewIlmDuedateComponent extends Component {
  @tracked @NotBlank() dueDate = this.args.ilmSession?.dueDate;

  @action
  revert() {
    this.dueDate = this.args.ilmSession.dueDate;
  }

  @action
  updateDate(date) {
    const currentDueDate = DateTime.fromJSDate(this.dueDate);
    this.dueDate = DateTime.fromJSDate(date)
      .set({
        hour: currentDueDate.hour,
        minute: currentDueDate.minute,
      })
      .toJSDate();
  }

  @action
  updateTime(value, type) {
    const update = 'hour' === type ? { hour: value } : { minute: value };
    this.dueDate = DateTime.fromJSDate(this.dueDate).set(update).toJSDate();
  }

  save = dropTask(async () => {
    this.addErrorDisplayFor('dueDate');
    const isValid = await this.isValid('dueDate');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('dueDate');
    this.args.ilmSession.dueDate = this.dueDate;
    await this.args.ilmSession.save();
  });
  <template>
    <div class="session-overview-ilm-duedate" data-test-session-overview-ilm-duedate ...attributes>
      <label>{{t "general.dueBy"}}:</label>
      <span>
        {{#if @ilmSession}}
          {{#if @editable}}
            <EditableField
              @value={{formatDate
                @ilmSession.dueDate
                month="2-digit"
                day="2-digit"
                year="2-digit"
                hour12=true
                hour="2-digit"
                minute="2-digit"
              }}
              @save={{perform this.save}}
              @close={{this.revert}}
            >
              <DatePicker @value={{this.dueDate}} @onChange={{this.updateDate}} />
              <TimePicker @date={{this.dueDate}} @action={{this.updateTime}} />
              <ValidationError @validatable={{this}} @property="dueDate" />
            </EditableField>
          {{else}}
            {{formatDate
              @ilmSession.dueDate
              month="2-digit"
              day="2-digit"
              year="2-digit"
              hour12=true
              hour="2-digit"
              minute="2-digit"
            }}
          {{/if}}
        {{/if}}
      </span>
    </div>
  </template>
}
