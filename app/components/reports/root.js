import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ReportsRootComponent extends Component {
  @tracked runningSubjectReport;
}
