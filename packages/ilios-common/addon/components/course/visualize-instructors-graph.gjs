import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { task, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import or from 'ember-truth-helpers/helpers/or';
import SimpleChart from 'ember-simple-charts/components/simple-chart';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn, array } from '@ember/helper';
import sortBy0 from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import sub_ from 'ember-math-helpers/helpers/sub';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class CourseVisualizeInstructorsGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.course));
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get hasData() {
    return this.data.length;
  }

  get chartData() {
    return this.data.filter((obj) => obj.data);
  }

  get filteredChartData() {
    return this.filterData(this.chartData);
  }

  get hasChartData() {
    return this.filteredChartData.length;
  }

  get filteredData() {
    return this.filterData(this.data);
  }

  get tableData() {
    return this.filteredData.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.instructor = obj.meta.user;
      rhett.instructorName = obj.meta.user.fullName;
      rhett.sessionTitles = mapBy(rhett.sessions, 'title').join(', ');
      return rhett;
    });
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  @action
  setSortBy(prop) {
    if (this.sortBy === prop) {
      prop += ':desc';
    }
    this.sortBy = prop;
  }

  filterData(data) {
    const q = cleanQuery(this.args.filter);
    if (q) {
      const exp = new RegExp(q, 'gi');
      return data.filter(({ label }) => label.match(exp));
    }
    return data;
  }

  async getData(course) {
    const sessions = await course.sessions;
    const sessionsWithInstructors = await map(sessions, async (session) => {
      const instructors = await session.getAllInstructors();
      const instructorsWithInstructionalTime = await map(instructors, async (instructor) => {
        const minutes = await session.getTotalSumOfferingsDurationByInstructor(instructor);
        return {
          instructor,
          minutes,
        };
      });
      return {
        session,
        instructorsWithInstructionalTime,
      };
    });

    return sessionsWithInstructors
      .reduce((set, { session, instructorsWithInstructionalTime }) => {
        instructorsWithInstructionalTime.forEach(({ instructor, minutes }) => {
          const id = instructor.id;
          let existing = findById(set, id);
          if (!existing) {
            existing = {
              id,
              data: 0,
              label: instructor.fullName,
              meta: {
                user: instructor,
                sessions: [],
              },
            };
            set.push(existing);
          }
          existing.data += minutes;
          existing.meta.sessions.push(session);
        });
        return set;
      }, [])
      .map((obj) => {
        obj.description = `${obj.meta.user.fullName} - ${obj.data} ${this.intl.t(
          'general.minutes',
        )}`;
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  barHover = task({ restartable: true }, async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    this.tooltipTitle = htmlSafe(
      `${obj.meta.user.fullName} &bull; ${obj.data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(
      uniqueValues(mapBy(obj.meta.sessions, 'title')).sort().join(', '),
    );
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }

    this.router.transitionTo('course-visualize-instructor', this.args.course.id, obj.meta.user.id);
  }

  downloadData = task({ drop: true }, async () => {
    const data = await this.getData(this.args.course);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.instructor')}`] = obj.meta.user.fullName;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-instructors.csv`, csv, 'text/csv');
  });
  <template>
    <div
      class="course-visualize-instructors-graph {{unless @isIcon 'not-icon'}}"
      data-test-course-visualize-instructors-graph
      ...attributes
    >
      {{#if this.isLoaded}}
        {{#if (or @isIcon this.hasChartData)}}
          {{#if this.hasChartData}}
            <SimpleChart
              @name="horz-bar"
              @isIcon={{@isIcon}}
              @data={{this.filteredChartData}}
              @onClick={{this.barClick}}
              @hover={{perform this.barHover}}
              @leave={{perform this.barHover}}
              as |chart|
            >
              {{#if this.tooltipContent}}
                <chart.tooltip @title={{this.tooltipTitle}}>
                  {{this.tooltipContent}}
                </chart.tooltip>
              {{/if}}
            </SimpleChart>
          {{else}}
            {{#if @showNoChartDataError}}
              <div class="no-data" data-test-no-data>
                {{t "general.courseVisualizationsInstructorsGraphNoData"}}
              </div>
            {{/if}}
          {{/if}}
        {{/if}}
        {{#if (and (not @isIcon) (not this.hasData))}}
          <div class="no-data" data-test-no-data>
            {{t "general.courseVisualizationsInstructorsGraphNoData"}}
          </div>
        {{/if}}
        {{#if (and (not @isIcon) this.hasData @showDataTable)}}
          <div class="data-table" data-test-data-table>
            <div class="table-actions" data-test-data-table-actions>
              <button
                type="button"
                {{on "click" (perform this.downloadData)}}
                data-test-download-data
              >
                <FaIcon @icon="download" />
                {{t "general.download"}}
              </button>
            </div>
            <table class="ilios-table">
              <thead>
                <tr>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "instructorName")
                      (eq this.sortBy "instructorName:desc")
                    }}
                    @onClick={{fn this.setSortBy "instructorName"}}
                    data-test-instructor
                  >
                    {{t "general.instructor"}}
                  </SortableTh>
                  <SortableTh
                    @colspan="2"
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "sessionTitles")
                      (eq this.sortBy "sessionTitles:desc")
                    }}
                    @onClick={{fn this.setSortBy "sessionTitles"}}
                    data-test-sessions
                  >
                    {{t "general.sessions"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or (eq this.sortBy "minutes") (eq this.sortBy "minutes:desc")}}
                    @onClick={{fn this.setSortBy "minutes"}}
                    @sortType="numeric"
                    data-test-minutes
                  >
                    {{t "general.minutes"}}
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {{#each (sortBy0 this.sortBy this.tableData) as |row|}}
                  <tr>
                    <td data-test-instructor>
                      <LinkTo
                        @route="course-visualize-instructor"
                        @models={{array @course.id row.instructor.id}}
                      >
                        {{row.instructorName}}
                      </LinkTo>
                    </td>
                    <td colspan="2" data-test-sessions>
                      {{#each row.sessions as |session index|}}
                        <LinkTo @route="session" @models={{array @course session}}>
                          {{session.title~}}
                        </LinkTo>{{if (notEq index (sub_ row.sessions.length 1)) ","}}
                      {{/each}}
                    </td>
                    <td data-test-minutes>{{row.minutes}}</td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
