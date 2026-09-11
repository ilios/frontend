import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
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
        {{on "click" (perform @add)}}
        data-test-add
      >
        <FaIcon
          @icon={{if @add.isRunning faSpinner faCheck}}
          @spin={{if @add.isRunning true false}}
        />
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
