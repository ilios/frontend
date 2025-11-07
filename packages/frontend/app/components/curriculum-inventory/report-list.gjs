import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import ReportListItem from 'frontend/components/curriculum-inventory/report-list-item';

export default class CurriculumInventoryReportListComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service iliosConfig;

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get sortBy() {
    return this.args.sortBy || 'name';
  }

  @action
  setSortBy(what) {
    if (this.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
  <template>
    <div data-test-curriculum-inventory-report-list ...attributes>
      <table class="ilios-zebra-table">
        <thead>
          <tr>
            <SortableTh
              @colspan={{4}}
              @sortedAscending={{this.sortedAscending}}
              @sortedBy={{or (eq this.sortBy "name") (eq this.sortBy "name:desc")}}
              @onClick={{fn this.setSortBy "name"}}
            >
              {{t "general.reportName"}}
            </SortableTh>
            <th class="text-center hide-from-small-screen" colspan="2">
              {{t "general.program"}}
            </th>
            <SortableTh
              class="hide-from-small-screen"
              @align="center"
              @colspan={{2}}
              @sortedAscending={{this.sortedAscending}}
              @sortedBy={{or (eq this.sortBy "year") (eq this.sortBy "year:desc")}}
              @sortType="numeric"
              @onClick={{fn this.setSortBy "year"}}
            >
              {{t "general.academicYear"}}
            </SortableTh>
            <th class="text-center hide-from-small-screen" colspan="2">
              {{t "general.startDate"}}
            </th>
            <th class="text-center hide-from-small-screen" colspan="2">
              {{t "general.endDate"}}
            </th>
            <th class="text-center" colspan="2">
              {{t "general.status"}}
            </th>
            <th class="text-right" colspan="2">
              {{t "general.actions"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each (sortBy this.sortBy @reports) as |report|}}
            <ReportListItem @report={{report}} @edit={{@edit}} @remove={{@remove}} />
          {{else}}
            <tr data-test-empty-list>
              <td class="text-left" colspan="4" data-test-name>
                {{t "general.none"}}
              </td>
              <td class="text-center hide-from-small-screen" colspan="2" data-test-program></td>
              <td class="text-center hide-from-small-screen" colspan="2" data-test-year></td>
              <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date></td>
              <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date></td>
              <td class="text-center" colspan="2" data-test-status></td>
              <td class="text-right report-actions" colspan="2" data-test-actions></td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
