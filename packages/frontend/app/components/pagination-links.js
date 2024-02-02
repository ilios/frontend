import Component from '@glimmer/component';
import { action } from '@ember/object';

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
}
