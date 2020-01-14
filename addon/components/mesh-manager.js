import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

const SEARCH_RESULTS_PER_PAGE = 50;

export default class MeshManagerComponent extends Component {
  @service store;
  @service intl;
  @tracked query = '';
  @tracked searchResults = [];
  @tracked searchPage = 0;
  @tracked hasMoreSearchResults = false;

  get sortedTerms(){
    if(!this.args.terms || this.args.terms.length === 0){
      return [];
    }
    return this.args.terms.sortBy('name');
  }
  @restartableTask
  *search(query) {
    this.searching = true;
    this.query = query;

    const descriptors = yield this.store.query('mesh-descriptor', {
      q: query,
      limit: SEARCH_RESULTS_PER_PAGE + 1
    });

    this.searching = false;
    this.searchPage = 1;
    this.hasMoreSearchResults = (descriptors.length > SEARCH_RESULTS_PER_PAGE);
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = descriptors;
  }

  @dropTask
  *searchMore() {
    const descriptors = yield this.store.query('mesh-descriptor', {
      q: this.query,
      limit: SEARCH_RESULTS_PER_PAGE + 1,
      offset: this.searchPage * SEARCH_RESULTS_PER_PAGE
    });
    this.searchPage = this.searchPage + 1;
    this.hasMoreSearchResults = (descriptors.length > SEARCH_RESULTS_PER_PAGE);
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = [...this.searchResults, ...descriptors];
  }

  @action
  clear() {
    this.searchResults = [];
    this.searching = false;
    this.searchPage = 0;
    this.hasMoreSearchResults = false;
    this.query = '';
  }

  @action
  add(term) {
    if (this.args.editable) {
      this.args.add(term);
    }
  }

  @action
  remove(term) {
    if (this.args.editable) {
      this.args.remove(term);
    }
  }

}
