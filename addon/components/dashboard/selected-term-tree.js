import Component from '@glimmer/component';

export default class DashboardSelectedTermTreeComponent extends Component {
  get level() {
    return this.args.level ?? 0;
  }
}
