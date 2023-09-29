import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ProgramYearOverviewComponent extends Component {
  @service features;
  get programYearVisualizations() {
    return this.features.isEnabled('programYearVisualizations');
  }
}
