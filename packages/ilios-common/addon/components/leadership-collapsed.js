import Component from '@glimmer/component';

export default class LeadershipCollapsed extends Component {
  get count() {
    const administratorsCount = this.args.showAdministrators
      ? (this.args.administratorsCount ?? 0)
      : 0;
    const directorsCount = this.args.showDirectors ? (this.args.directorsCount ?? 0) : 0;
    const studentAdvisorsCount = this.args.showStudentAdvisors
      ? (this.args.studentAdvisorsCount ?? 0)
      : 0;
    return administratorsCount + directorsCount + studentAdvisorsCount;
  }
}
