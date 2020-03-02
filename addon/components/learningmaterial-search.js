import Component from '@glimmer/component';
import { dropTask, enqueueTask, restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LearningMaterialSearchComponent extends Component {
  @service store;
  @service intl;
  @tracked query = '';
  @tracked searchResults = [];
  @tracked searchPage = 0;

  @tracked searchResultsPerPage = 50;
  @tracked hasMoreSearchResults = false;
  @tracked searchReturned = false;

  @restartableTask
  *search(query){
    if (query.trim() === '') {
      this.searchReturned = false;
      this.searchPage = 1;
      this.hasMoreSearchResults = false;
      this.searchResults = [];
      return;
    }
    this.searchReturned = false;
    this.query = query;
    const results = yield this.store.query('learningMaterial', {
      q: query,
      limit: this.searchResultsPerPage + 1,
      'order_by[title]': 'ASC',
    });

    const lms = results.toArray();
    this.searchReturned = true;
    this.searching = false;
    this.searchPage = 1;
    this.hasMoreSearchResults = lms.length > this.searchResultsPerPage;
    if (this.hasMoreSearchResults) {
      lms.pop();
    }
    this.searchResults =  lms;
  }

  @action
  clear(){
    this.searchResults = [];
    this.searchReturned = false;
    this.searching = false;
    this.searchPage = 0;
    this.hasMoreSearchResults = false;
    this.query = '';
  }
  @dropTask
  *searchMore() {
    const results  = yield this.store.query('learningMaterial', {
      q: this.query,
      limit: this.searchResultsPerPage + 1,
      offset: this.searchPage * this.searchResultsPerPage,
      'order_by[title]': 'ASC',
    });
    const lms = results.toArray();
    this.searchPage = this.searchPage + 1;
    this.hasMoreSearchResults = lms.length > this.searchResultsPerPage;
    if (this.hasMoreSearchResults) {
      lms.pop();
    }
    this.searchResults = [...this.searchResults, ...lms];
  }

  @enqueueTask
  *addLearningMaterial(lm) {
    yield this.args.add(lm);
  }
}
