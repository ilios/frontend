import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import Header from 'frontend/components/reports/curriculum/header';
import noop from 'ilios-common/helpers/noop';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import repeat from 'ilios-common/helpers/repeat';
import truncate from 'ilios-common/helpers/truncate';
import random from 'ember-math-helpers/helpers/random';

export default class ReportsCurriculumLoading extends Component {
  @service router;
  @service intl;
  @service store;
  @service currentUser;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get allSchools() {
    return this.store.peekAll('school');
  }

  get primarySchool() {
    return this.allSchools.find(({ id }) => id === this.user?.belongsTo('school').id());
  }

  get queryParams() {
    return this.router.currentRoute.queryParams;
  }

  get guessCourses() {
    return this.queryParams?.courses?.split('-').length;
  }

  get selectedReportValue() {
    return this.queryParams?.report ?? 'sessionObjectives';
  }
  <template>
    <div
      class="reports-curriculum reports-curriculum-loading"
      data-test-reports-curriculum
      ...attributes
    >
      <Header
        @countSelectedCourses={{this.guessCourses}}
        @showReportResults={{false}}
        @loading={{false}}
        @selectedReportValue={{this.selectedReportValue}}
        @changeSelectedReport={{(noop)}}
        @runReport={{(noop)}}
        @close={{(noop)}}
      />
      <div class="reports-choose-course">
        <div class="schools">
          <FaIcon @icon="building-columns" />
          <select aria-label={{t "general.filterBySchool"}} disabled>
            <option>{{this.primarySchool.title}}</option>
          </select>
        </div>
        <ul class="year">
          <li>
            <button type="button">
              {{2025}}
              <FaIcon @icon="caret-right" />
            </button>
          </li>
          <li>
            <button type="button">
              {{2024}}
              <FaIcon @icon="caret-down" />
            </button>
            <ul class="courses">
              {{! template-lint-disable no-unused-block-params }}
              {{#each (repeat 5)}}
                <li>
                  <label>
                    <input type="checkbox" disabled />
                    {{truncate (repeat (random 3 10) "ilios rocks") 100}}
                  </label>
                </li>
              {{/each}}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </template>
}
