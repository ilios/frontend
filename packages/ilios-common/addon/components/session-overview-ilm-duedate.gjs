<div class="session-overview-ilm-duedate" data-test-session-overview-ilm-duedate ...attributes>
  <label>{{t "general.dueBy"}}:</label>
  <span>
    {{#if @ilmSession}}
      {{#if @editable}}
        <EditableField
          @value={{format-date
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
        {{format-date
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