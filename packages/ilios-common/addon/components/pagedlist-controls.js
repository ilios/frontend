import Component from '@glimmer/component';
import { action } from '@ember/object';

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
      return false;
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
}
