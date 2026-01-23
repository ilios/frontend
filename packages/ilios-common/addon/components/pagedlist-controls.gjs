import Component from '@glimmer/component';
import { action } from '@ember/object';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import isEqual from 'ember-truth-helpers/helpers/is-equal';
import { faBackwardFast, faForwardFast, faPlay } from '@fortawesome/free-solid-svg-icons';

export default class PagedlistControlsComponent extends Component {
  get offset() {
    return this.args.offset ? parseInt(this.args.offset, 10) : 0;
  }

  get limit() {
    return this.args.limit ? parseInt(this.args.limit, 10) : 0;
  }

  get total() {
    return this.args.total ? parseInt(this.args.total, 10) : 0;
  }

  get firstPage() {
    return this.offset <= 0;
  }

  get numPages() {
    if (this.limit) {
      return Math.ceil(this.total / this.limit);
    }
    return 1;
  }

  get start() {
    return this.offset + 1;
  }

  get end() {
    const total = this.total;
    let end = this.offset + this.limit;
    if (end > total) {
      end = total;
    }

    return end;
  }

  get offsetOptions() {
    const total = this.args.limitless ? 1000 : this.total;
    const available = [10, 25, 50, 100, 200, 400, 1000];
    const options = available.filter((option) => {
      return option < total;
    });
    options.push(available[options.length]);

    return options;
  }

  get lastPage() {
    if (this.args.limitless) {
      // return false;
      return this.limit >= this.total;
    }
    return this.offset + this.limit >= this.total;
  }

  @action
  goForward() {
    const offset = this.offset;
    const limit = this.limit;
    this.args.setOffset(offset + limit);
  }

  @action
  goToFirst() {
    this.args.setOffset(0);
  }

  @action
  goToLast() {
    this.args.setOffset(this.limit * (this.numPages - 1));
  }

  @action
  goBack() {
    const offset = this.offset;
    const limit = this.limit;
    this.args.setOffset(offset - limit);
  }

  @action
  setOffset(offset) {
    const limit = this.limit;
    const total = this.total;
    const largestOffset = total - limit;
    if (offset < 0) {
      offset = 0;
    }
    if (offset > largestOffset) {
      offset = largestOffset;
    }

    this.args.setOffset(offset);
  }

  @action
  setLimit(limit) {
    this.args.setLimit(parseInt(limit, 10));
    this.args.setOffset(0);
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="pagedlist-controls" data-test-pagedlist-controls ...attributes>
        {{#unless @limitless}}
          <button
            class="link-button backward"
            type="button"
            title={{t "general.first"}}
            disabled={{this.firstPage}}
            data-test-go-to-first
            {{on "click" this.goToFirst}}
          >
            <FaIcon @icon={{faBackwardFast}} class={{if this.firstPage "disabled"}} />
          </button>
        {{/unless}}
        <button
          class="link-button backward"
          type="button"
          title={{t "general.previous"}}
          disabled={{this.firstPage}}
          data-test-go-to-previous
          {{on "click" this.goBack}}
        >
          <FaIcon @icon={{faPlay}} @flip="horizontal" class={{if this.firstPage "disabled"}} />
        </button>
        {{#if @limitless}}
          <select
            aria-labelledby="per-page-{{templateId}}"
            {{on "change" (pick "target.value" this.setLimit)}}
            data-test-limits
          >
            {{#each this.offsetOptions as |o|}}
              <option value={{o}} selected={{isEqual o this.limit}} data-test-limit>
                {{o}}
              </option>
            {{/each}}
          </select>
          <span id="per-page-{{templateId}}">{{t "general.perPage"}}</span>
        {{else}}
          <span data-test-paged-results-count>
            {{t "general.pagedResultsCount" start=this.start end=this.end total=this.total}}
          </span>
        {{/if}}
        <button
          class="link-button forward"
          type="button"
          title={{t "general.next"}}
          disabled={{this.lastPage}}
          data-test-go-to-next
          {{on "click" this.goForward}}
        >
          <FaIcon @icon={{faPlay}} class={{if this.lastPage "disabled"}} />
        </button>
        {{#unless @limitless}}
          <button
            class="link-button forward"
            type="button"
            title={{t "general.last"}}
            disabled={{this.lastPage}}
            data-test-go-to-last
            {{on "click" this.goToLast}}
          >
            <FaIcon @icon={{faForwardFast}} class={{if this.lastPage "disabled"}} />
          </button>
          <select
            aria-labelledby="per-page-{{templateId}}"
            {{on "change" (pick "target.value" this.setLimit)}}
            data-test-limits
          >
            {{#each this.offsetOptions as |o|}}
              <option value={{o}} selected={{isEqual o this.limit}} data-test-limit>
                {{o}}
              </option>
            {{/each}}
          </select>
          <span id="per-page-{{templateId}}">{{t "general.perPage"}}</span>
        {{/unless}}
      </div>
    {{/let}}
  </template>
}
