import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailTaxonomiesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked bufferedTerms = [];
  @tracked isManaging = false;

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.subject.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : null;
  }

  get showCollapsible() {
    const terms = this.args.subject.hasMany('terms').ids();
    return !this.isManaging && terms.length;
  }

  manage = dropTask(async () => {
    this.args.expand();
    const terms = await this.args.subject.terms;
    this.bufferedTerms = [...terms];
    this.isManaging = true;
  });

  save = dropTask(async () => {
    this.args.subject.set('terms', this.bufferedTerms);
    await this.args.subject.save();
    this.isManaging = false;
  });

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
  removeTermFromBuffer(term) {
    this.bufferedTerms = this.bufferedTerms.filter((obj) => obj.id !== term.id);
  }
}
