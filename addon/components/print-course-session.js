import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class PrintCourseSessionComponent extends Component {
  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  @cached
  get learningMaterialsData() {
    return new TrackedAsyncData(this.args.session.learningMaterials);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.session.meshDescriptors);
  }

  @cached
  get offeringsData() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.session.terms);
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : [];
  }

  get learningMaterials() {
    return this.learningMaterialsData.isResolved ? this.learningMaterialsData.value : [];
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  get offerings() {
    return this.offeringsData.isResolved ? this.offeringsData.value : [];
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }
}
