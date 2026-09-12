import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { or } from 'ember-truth-helpers';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faCheck, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default class BigAddCancelButtonsComponent extends Component {
  @service intl;

  <template>
    <div data-test-big-add-cancel-buttons>
      <button
        aria-label={{t "general.save"}}
        type="button"
        class={{if @addClasses @addClasses "bigadd"}}
        disabled={{@disableSave}}
        title={{@title}}
        {{on "click" @add}}
        data-test-add
      >
        {{#if @iconSpinOverride}}
          <FaIcon @icon={{if @iconSpin faSpinner faCheck}} @spin={{if @iconSpin true false}} />
        {{else}}
          <FaIcon
            @icon={{if (or @add.isRunning @disableSave) faSpinner faCheck}}
            @spin={{if (or @add.isRunning @disableSave) true false}}
          />
        {{/if}}
        {{#if @addProgress}}
          {{@addProgress}}%
        {{/if}}
      </button>
      <button
        aria-label={{t "general.cancel"}}
        type="button"
        class={{if @cancelClasses @cancelClasses "bigcancel"}}
        disabled={{if @disableCancel @disableCancel @add.isRunning}}
        {{on "click" @cancel}}
        data-test-cancel
      >
        <FaIcon @icon={{faArrowRotateLeft}} />
      </button>
    </div>
  </template>
}
