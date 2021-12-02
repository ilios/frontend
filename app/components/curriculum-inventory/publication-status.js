import Component from '@glimmer/component';

export default class CurriculumInventoryReportPublicationStatus extends Component {
  isFinalized = this.args.item.belongsTo('export').id();
}
