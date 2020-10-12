import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import scrollIntoView from 'scroll-into-view';

export default class CurriculumInventoryVerificationPreviewComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @tracked tables = null;
  @tracked scrollTargets = {};

  @task
  *load(element, [report]) {
    const url = `${this.iliosConfig.apiNameSpace}/curriculuminventoryreports/${report.id}/verificationpreview`;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.tables = data.preview;
  }

  @action
  scrollTo(key) {
    scrollIntoView(this.scrollTargets[key]);
  }

  @action
  setScrollTarget(element, [key]) {
    this.scrollTargets[key] = element;
  }
}
