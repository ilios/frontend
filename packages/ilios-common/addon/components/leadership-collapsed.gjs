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

<section class="leadership-collapsed" data-test-leadership-collapsed>
  <div>
    <button
      class="title link-button"
      type="button"
      aria-expanded="false"
      data-test-title
      {{on "click" @expand}}
    >
      {{t "general.leadership"}}
      ({{this.count}})
      <FaIcon @icon="caret-right" />
    </button>
  </div>
  <div class="content">
    <table class="condensed">
      <thead>
        <tr>
          <th colspan="2" class="text-left">
            {{t "general.summary"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#if @showDirectors}}
          <tr>
            <td>
              {{t "general.directors"}}
            </td>
            <td>
              {{t "general.directorCount" count=@directorsCount}}
            </td>
          </tr>
        {{/if}}
        {{#if @showAdministrators}}
          <tr>
            <td>
              {{t "general.administrators"}}
            </td>
            <td>
              {{t "general.administratorCount" count=@administratorsCount}}
            </td>
          </tr>
        {{/if}}
        {{#if @showStudentAdvisors}}
          <tr>
            <td>
              {{t "general.studentAdvisors"}}
            </td>
            <td>
              {{t "general.studentAdvisorCount" count=@studentAdvisorsCount}}
            </td>
          </tr>
        {{/if}}
      </tbody>
    </table>
  </div>
</section>