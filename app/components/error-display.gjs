import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import { not } from 'ember-truth-helpers';
import formatTime from 'ember-intl/helpers/format-time';

export default class ErrorDisplayComponent extends Component {
  @service intl;
  @tracked showDetails = true;

  now = new Date();

  /**
   * Ember data gives us a nice error title, if we find other
   * error producers that do this we can add them here as well.
   **/
  get mainMessage() {
    if (this.args.error.errors?.[0]?.title) {
      return this.args.error.errors[0]?.title;
    }

    return this.intl.t('general.error');
  }

  <template>
    <div class="error-display main-section" ...attributes>
      <h2>
        {{t "general.errorDisplayMessage"}}
      </h2>
      <p class="clear-error">
        <button type="button" {{on "click" @clearError}}>
          {{t "general.clearErrors"}}
        </button>
        <button
          type="button"
          class="error-detail-action"
          {{on "click" (set this "showDetails" (not this.showDetails))}}
        >
          {{t (if this.showDetails "general.collapseDetails" "general.expandDetails")}}
        </button>
      </p>

      {{#if this.showDetails}}
        <p class="timestamp">{{formatTime this.now}}</p>
        <div class="error-detail">
          <h3 class="error-main-message" data-test-main-message>
            {{this.mainMessage}}
          </h3>
          {{#if @error.statusCode}}
            <span class="error-status-code" data-test-status-code>
              {{t "general.statusCode"}}:
              {{@error.statusCode}}
            </span>
          {{/if}}
          {{#if @error.message}}
            <h4>{{t "general.message"}}</h4>
            <p class="error-message" data-test-message>
              {{@error.message}}
            </p>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
