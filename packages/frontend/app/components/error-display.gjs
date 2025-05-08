import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import NotFound from 'ilios-common/components/not-found';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import formatTime from 'ember-intl/helpers/format-time';

export default class ErrorDisplayComponent extends Component {
  @tracked isOffline = !navigator.onLine;
  @tracked showDetails = true;
  now = new Date();

  get is404() {
    if (this.args.errors.length) {
      return this.args.errors[0].statusCode === '404';
    }
    return false;
  }
  refresh() {
    window.location.reload();
  }
  <template>
    <div class="error-display" ...attributes>
      <div class="error-main">
        {{#if this.isOffline}}
          <h2>
            {{t "general.connectionLost"}}
          </h2>
          <p class="clear-errors">
            <button type="button" {{on "click" this.refresh}}>
              <FaIcon @icon="rotate" />
              {{t "general.reconnectNow"}}
            </button>
          </p>
        {{else if this.is404}}
          <NotFound />
        {{else}}
          <h2>
            {{t "general.errorDisplayMessage"}}
          </h2>
          <p class="clear-errors">
            <button type="button" {{on "click" @clearErrors}}>
              {{t "general.clearErrors"}}
            </button>
            <button
              type="button"
              class="error-detail-action"
              {{on "click" (set this "showDetails" (not this.showDetails))}}
            >
              {{t (if this.showDetails "general.collapseDetail" "general.expandDetail")}}
            </button>
          </p>

          {{#if this.showDetails}}
            <div class="timestamp">
              {{formatTime
                this.now
                year="numeric"
                month="numeric"
                day="numeric"
                hour="numeric"
                second="numeric"
                minute="numeric"
                timeZoneName="short"
              }}
            </div>
            <div class="error-detail">
              <h3 class="error-total">
                {{t "general.totalErrors" count=@errors.length}}
              </h3>
              {{#each @errors as |error|}}
                <div class="error-details">
                  <h5 class="error-main-message">
                    {{error.mainMessage}}
                  </h5>
                  {{#if error.statusCode}}
                    <span class="error-status-code">
                      {{t "general.statusCode"}}:
                      {{error.statusCode}}
                    </span>
                  {{/if}}
                  {{#if error.message}}
                    <span class="error-message">
                      {{t "general.message"}}:
                      {{error.message}}
                    </span>
                  {{/if}}
                  <pre class="error-stack">
                {{error.stack}}
              </pre>
                </div>
              {{/each}}
            </div>
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
