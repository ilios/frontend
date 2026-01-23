import Component from '@glimmer/component';
import { action } from '@ember/object';
import gt from 'ember-truth-helpers/helpers/gt';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import { faAngleLeft, faAngleRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';

export default class PaginationLinksComponent extends Component {
  get disablePrev() {
    return this.args.page === 1;
  }

  get disableNext() {
    return this.lastPage === this.args.page;
  }

  get lastPage() {
    return Math.ceil(this.args.results.length / this.args.size);
  }

  get pages() {
    return this.lastPage <= 7
      ? this.simplePages(this.lastPage)
      : this.complexPages(this.lastPage, this.args.page);
  }

  @action
  selectPage(value) {
    this.args.onSelectPage(this.args.page + value);
  }

  simplePages(lastPage) {
    const pageNumbers = [];

    for (let i = 1; i <= lastPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }

  complexPages(lastPage, page) {
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', lastPage];
    }

    if (page >= lastPage - 3) {
      return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    }

    return [1, '...', page - 1, page, page + 1, page + 2, '...', lastPage];
  }
  <template>
    <div class="pagination-links" data-test-pagination-links ...attributes>
      {{#if (gt @results.length @size)}}
        <button
          type="button"
          class="link-button prev"
          {{on "click" (fn this.selectPage -1)}}
          disabled={{this.disablePrev}}
          data-test-prev
        >
          <FaIcon @icon={{faAngleLeft}} />
          {{t "general.prev"}}
        </button>
        {{#each this.pages as |pageNumber|}}
          {{#if (eq pageNumber "...")}}
            <FaIcon @icon={{faEllipsis}} />
          {{else}}
            <button
              type="button"
              class="page-button"
              disabled={{eq @page pageNumber}}
              {{on "click" (fn @onSelectPage pageNumber)}}
              data-test-page-button
              data-test-page-
              {{pageNumber}}
            >
              {{pageNumber}}
            </button>
          {{/if}}
        {{/each}}
        <button
          type="button"
          class="link-button next"
          disabled={{this.disableNext}}
          {{on "click" (fn this.selectPage 1)}}
          data-test-next
        >
          {{t "general.next"}}
          <FaIcon @icon={{faAngleRight}} />
        </button>
      {{/if}}
    </div>
  </template>
}
