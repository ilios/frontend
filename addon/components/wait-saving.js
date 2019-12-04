import Component from '@glimmer/component';

export default class WaitSaving extends Component {
  get progress(){
    const total = this.args.totalProgress || 1;
    const current = this.args.currentProgress || 0;
    return Math.floor(current / total * 100);
  }
}
