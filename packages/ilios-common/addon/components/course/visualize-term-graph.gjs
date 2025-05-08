import Component from '@glimmer/component';
import { map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeTermGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.args.course, this.args.term));
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

  get hasChartData() {
    return this.chartData.length;
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.sessionType = obj.meta.sessionType.title;
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

  async getDataObjects(course, term) {
    const sessions = await course.sessions;
    const sessionIds = term.hasMany('sessions').ids();
    const filteredSessions = sessions.filter((session) => sessionIds.includes(session.id));
    const sessionTypes = await Promise.all(filteredSessions.map((s) => s.sessionType));
    const sessionTypeData = await map(filteredSessions, async (session) => {
      const hours = await session.getTotalSumDuration();
      const sessionType = findById(sessionTypes, session.belongsTo('sessionType').id());
      return {
        session,
        sessionType,
        minutes: Math.round(hours * 60),
      };
    });

    return sessionTypeData
      .reduce((set, { sessionType, session, minutes }) => {
        const id = sessionType.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: sessionType.title,
            meta: {
              sessionType: sessionType,
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
        obj.description = `${obj.meta.sessionType.title} - ${obj.data} ${this.intl.t('general.minutes')}`;
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  barHover = restartableTask(async (obj) => {
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
    this.tooltipContent = htmlSafe(mapBy(meta.sessions, 'title').sort().join(', '));
  });

  downloadData = dropTask(async () => {
    const data = await this.getDataObjects(this.args.course, this.args.term);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.sessionType')}`] = obj.meta.sessionType.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-course-${this.args.course.id}-vocabulary-term-${this.args.term.id}-session-types`,
      csv,
      'text/csv',
    );
  });
}

<div
  class="course-visualize-term-graph {{unless @isIcon 'not-icon'}}"
  data-test-course-visualize-term-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if (or @isIcon this.hasChartData)}}
      <SimpleChart
        @name="horz-bar"
        @isIcon={{@isIcon}}
        @data={{this.chartData}}
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
    {{/if}}
    {{#if (and (not @isIcon) (not this.hasData))}}
      <div class="no-data" data-test-no-data>
        {{t "general.courseVisualizationsTermGraphNoData" term=@term.title}}
      </div>
    {{/if}}
    {{#if (and (not @isIcon) this.hasData @showDataTable)}}
      <div class="data-table" data-test-data-table>
        <div class="table-actions" data-test-data-table-actions>
          <button type="button" {{on "click" (perform this.downloadData)}} data-test-download-data>
            <FaIcon @icon="download" />
            {{t "general.download"}}
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <SortableTh
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq this.sortBy "sessionType") (eq this.sortBy "sessionType:desc")}}
                @onClick={{fn this.setSortBy "sessionType"}}
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
            {{#each (sort-by this.sortBy this.tableData) as |row|}}
              <tr>
                <td data-test-session-type>{{row.sessionType}}</td>
                <td colspan="2" data-test-sessions>
                  {{#each row.sessions as |session index|}}
                    <LinkTo @route="session" @models={{array @course session}}>
                      {{session.title~}}
                    </LinkTo>{{if (not-eq index (sub row.sessions.length 1)) ","}}
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