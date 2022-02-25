import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DashboardMaterialsComponent extends Component {
  @tracked showAllMaterials = false;
  daysInAdvance = 60;
}
