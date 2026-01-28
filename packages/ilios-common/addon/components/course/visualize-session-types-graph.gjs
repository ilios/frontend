import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import or from 'ember-truth-helpers/helpers/or';
import SimpleChart from 'ember-simple-charts/components/simple-chart';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn, array } from '@ember/helper';
import sortBy0 from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import sub_ from 'ember-math-helpers/helpers/sub';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

export default class CourseVisualizeSessionTypesGraph extends Component {
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
      rhett.sessionType = obj.meta.sessionType;
      rhett.sessionTypeTitle = obj.meta.sessionType.title;
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

    if (!sessions.length) {
      return [];
    }

    const dataMap = await map(sessions, async (session) => {
      const hours = await session.getTotalSumDuration();
      const minutes = Math.round(hours * 60);
      const sessionType = await session.sessionType;
      return {
        session,
        sessionType,
        minutes,
      };
    });

    return dataMap
      .reduce((set, { sessionType, session, minutes }) => {
        const id = sessionType.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: sessionType.title,
            meta: {
              sessionType,
              sessions: [],
            },
          };
          set.push(existing);
        }
        existing.data += minutes;
        existing.meta.sessions.push(session);

        return set;
      }, [])
      .map((obj) => {
        obj.description = `${obj.meta.sessionType.title} - ${obj.data} ${this.intl.t(
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
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { data, meta } = obj;
    this.tooltipTitle = htmlSafe(
      `${meta.sessionType.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(uniqueValues(mapBy(meta.sessions, 'title')).sort().join(', '));
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo(
      'course-visualize-session-type',
      this.args.course.id,
      obj.meta.sessionType.id,
    );
  }

  downloadData = task({ drop: true }, async () => {
    const data = await this.getData(this.args.course);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = obj.meta.sessionType.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-session-types.csv`, csv, 'text/csv');
  });
  <template>
    <div
      class="graph-with-data-table {{unless @isIcon 'not-icon'}}"
      data-test-course-visualize-session-types-graph
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
                {{t "general.courseVisualizationsNoSessions"}}
              </div>
            {{/if}}
          {{/if}}
        {{/if}}
        {{#if (and (not @isIcon) (not this.hasData))}}
          <div class="no-data" data-test-no-data>
            {{t "general.courseVisualizationsNoSessions"}}
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
                <FaIcon @icon={{faDownload}} />
                {{t "general.download"}}
              </button>
            </div>
            <table class="ilios-table ilios-table-colors ilios-zebra-table">
              <thead>
                <tr>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "sessionTypeTitle")
                      (eq this.sortBy "sessionTypeTitle:desc")
                    }}
                    @onClick={{fn this.setSortBy "sessionTypeTitle"}}
                    data-test-session-type
                  >
                    {{t "general.sessionType"}}
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
                    <td data-test-session-type>
                      <LinkTo
                        @route="course-visualize-session-type"
                        @models={{array @course.id row.sessionType.id}}
                      >
                        {{row.sessionTypeTitle}}
                      </LinkTo>
                    </td>
                    <td colspan="2" data-test-sessions>
                      {{#each row.sessions as |session index|}}
                        <LinkTo
                          @route="session"
                          @models={{array @course session}}
                          aria-label={{session.uniqueTitleInCourse}}
                        >
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
