import Component from '@glimmer/component';

export default class SessionsGridLoading extends Component {
  now = new Date();
}

<div
  class="sessions-grid-loading"
  role="presentation"
  aria-hidden="true"
  {{animate-loading "course" finalOpacity=".75"}}
>
  {{! template-lint-disable no-unused-block-params }}
  {{#each (repeat @count) as |empty|}}
    <div data-test-row>
      <span class="expand-collapse-control"></span>
      <span class="session-grid-title">
        {{truncate (repeat (random 3 10) "ilios rocks") 100}}
      </span>
      <span class="session-grid-type">
        {{repeat (random 1 3) "loading "}}
      </span>
      <span class="session-grid-groups">
        {{random 1 99}}
      </span>
      <span class="session-grid-objectives">
        {{random 1 99}}
      </span>
      <span class="session-grid-terms">
        {{random 1 99}}
      </span>
      <span class="session-grid-first-offering">
        {{format-date
          this.now
          day="2-digit"
          month="2-digit"
          year="numeric"
          hour12=true
          hour="2-digit"
          minute="2-digit"
        }}
      </span>
      <span class="session-grid-offerings">
        {{random 1 99}}
      </span>
      <span class="session-grid-status">
        <FaIcon @icon="star-half-stroke" />
      </span>
      <span class="session-grid-actions"></span>
    </div>
  {{/each}}
</div>