{{#let (unique-id) as |templateId|}}
  <section class="school-emails-editor" data-test-school-emails-editor ...attributes>
    <div class="header">
      <div class="title">{{t "general.emails"}}</div>
      <div class="actions">
        <button type="button" class="bigadd" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{this.save.isRunning}}
          />
        </button>
        <button type="button" class="bigcancel" {{on "click" @cancel}} data-test-cancel>
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      </div>
    </div>
    <div class="content">
      <div class="form">
        <div class="item" data-test-administrator-email>
          <label for="administrator-email-{{templateId}}">
            {{t "general.administratorEmail"}}
          </label>
          <input
            id="administrator-email-{{templateId}}"
            type="text"
            value={{this.administratorEmail}}
            placeholder={{this.administratorEmailPlaceholder}}
            {{on "input" (pick "target.value" (set this "administratorEmail"))}}
            {{on
              "keyup"
              (queue (fn this.addErrorDisplayFor "administratorEmail") (perform this.saveOrCancel))
            }}
          />
          <ValidationError @validatable={{this}} @property="administratorEmail" />
        </div>
        <div class="item" data-test-change-alert-recipients>
          <label for="change-alert-recipients-{{templateId}}">
            {{t "general.changeAlertRecipients"}}
          </label>
          <input
            id="change-alert-recipients-{{templateId}}"
            type="text"
            value={{this.changeAlertRecipients}}
            placeholder={{this.changeAlertRecipientsPlaceholder}}
            {{on "input" (pick "target.value" (set this "changeAlertRecipients"))}}
            {{on
              "keyup"
              (queue
                (fn this.addErrorDisplayFor "changeAlertRecipients") (perform this.saveOrCancel)
              )
            }}
          />
          <ValidationError @validatable={{this}} @property="changeAlertRecipients" />
        </div>
      </div>
    </div>
  </section>
{{/let}}