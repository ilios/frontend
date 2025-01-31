import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';

export default class ProgramYearOverviewComponent extends Component {
  get showVisualizations() {
    const config = getOwner(this)?.resolveRegistration('config:environment');
    return !!config?.featureFlags?.programYearVisualizations;
  }
}
