import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryReportPublicationStatus extends Component {
  @tracked isFinalized = this.args.item.belongsTo('export').id();
}
