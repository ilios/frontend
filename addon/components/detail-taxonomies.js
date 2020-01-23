import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';

export default class DetailTaxonomiesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;

  @tracked bufferedTerms = [];
  @tracked isManaging = false;

  get showCollapsible () {
    const terms = this.args.subject.hasMany('terms').ids();
    return !this.isManaging && terms.length;
  }

  @dropTask
  *manage() {
    this.args.expand();
    const terms = yield this.args.subject.terms;
    this.bufferedTerms = [...terms.toArray()];
    this.isManaging = true;
  }

  @dropTask
  *save() {
    this.args.subject.set('terms', this.bufferedTerms);
    yield this.args.subject.save();
    this.isManaging = false;
  }

  @action
  collapse() {
    if (this.showCollapsible) {
      this.args.collapse();
    }
  }
  @action
  cancel() {
    this.bufferedTerms = [];
    this.isManaging = false;
  }

  @action
  addTermToBuffer(term) {
    this.bufferedTerms = [...this.bufferedTerms, term];
  }
  @action
  removeTermFromBuffer(term){
    this.bufferedTerms = this.bufferedTerms.filter(obj => obj.id !== term.id);
  }
}
