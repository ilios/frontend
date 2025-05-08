import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import striptags from 'striptags';
import PapaParse from 'papaparse';
import { mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import createDownloadFile from 'ilios-common/utils/create-download-file';

export default class CourseVisualizeObjectivesGraph extends Component {
  @service router;
  @service intl;
  @service dataLoader;

  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'percentage:desc';

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.sessions));
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get hasData() {
    return this.data.length;
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      // KLUDGE!
      // multiply by 1,000 to get everything back to full numbers.
      // that way, we can rely on string sorting rather than having to implement our own
      // sorting callback.
      // [ST 2022/10/06]
      rhett.percentage = obj.percentage * 1000;
      rhett.percentageLabel = obj.label;
      rhett.objective = obj.meta.courseObjective.title;
      rhett.competencies = obj.meta.competencies;
      rhett.sessions = sortBy(mapBy(obj.meta.sessionObjectives, 'session'), 'title');
      rhett.sessionTitles = mapBy(rhett.sessions, 'title').join(', ');
      return rhett;
    });
  }

  get objectiveWithMinutes() {
    return this.data.filter((obj) => obj.data !== 0);
  }

  get objectiveWithoutMinutes() {
    return this.data.filter((obj) => obj.data === 0);
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  @action
  setSortBy(prop) {
    if (this.sortBy === prop) {
      prop += ':desc';
    }
    this.sortBy = prop;
  }

  async getDataObjects(sessions) {
    const sessionsWithMinutes = sessions.map(async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const sessionCourseObjectiveMap = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const sessionObjectives = await session.sessionObjectives;
        const sessionObjectivesWithParents = await filter(
          sessionObjectives,
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return parents.length;
          },
        );
        const courseSessionObjectives = await map(
          sessionObjectivesWithParents,
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return mapBy(parents, 'id');
          },
        );
        const flatObjectives = courseSessionObjectives.reduce((flattened, arr) => {
          return [...flattened, ...arr];
        }, []);

        return {
          sessionTitle: session.title,
          session,
          objectives: flatObjectives,
          minutes,
        };
      },
    );

    // condensed objectives map
    const courseObjectives = await this.args.course.courseObjectives;
    const mappedObjectives = await map(courseObjectives, async (courseObjective) => {
      const programYearObjectives = await courseObjective.programYearObjectives;
      const competencyTitles = (
        await map(programYearObjectives, async (pyObjective) => {
          const competency = await pyObjective.competency;
          return competency ? competency.title : null;
        })
      )
        .filter((title) => !!title)
        .sort();
      const minutes = sessionCourseObjectiveMap.map((obj) => {
        if (obj.objectives.includes(courseObjective.id)) {
          return obj.minutes;
        } else {
          return 0;
        }
      });
      const sessionObjectives = sessionCourseObjectiveMap.filter((obj) =>
        obj.objectives.includes(courseObjective.id),
      );
      const meta = {
        competencies: uniqueValues(competencyTitles).join(', '),
        courseObjective,
        sessionObjectives,
      };
      const data = minutes.reduce((accumulator, current) => accumulator + parseInt(current, 10), 0);

      return {
        data,
        meta,
      };
    });

    const totalMinutes = mapBy(mappedObjectives, 'data').reduce(
      (total, minutes) => total + minutes,
      0,
    );

    return mappedObjectives.map((obj) => {
      const percent = totalMinutes ? ((obj.data / totalMinutes) * 100).toFixed(1) : 0;
      let objectiveTitle = obj.meta.courseObjective.title;
      if (obj.meta.competencies) {
        objectiveTitle += ` (${obj.meta.competencies})`;
      }
      obj.label = `${percent}%`;
      obj.description = `${objectiveTitle} - ${obj.data} ${this.intl.t('general.minutes')}`;
      obj.percentage = percent;
      return obj;
    });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
    }
    const { data, meta } = obj;

    let objectiveTitle = meta.courseObjective.title;
    if (meta.competencies) {
      objectiveTitle += `(${meta.competencies})`;
    }

    this.tooltipTitle = htmlSafe(
      `${objectiveTitle} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(mapBy(meta.sessionObjectives, 'sessionTitle').sort().join(', '));
  });

  downloadData = dropTask(async () => {
    const sessions = await this.args.course.sessions;
    const data = await this.getDataObjects(sessions);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.percentage')] = obj.percentage;
      rhett[this.intl.t('general.courseObjective')] = striptags(obj.meta.courseObjective.title);
      rhett[this.intl.t('general.competencies')] = obj.meta.competencies;
      rhett[this.intl.t('general.sessions')] = mapBy(
        sortBy(mapBy(obj.meta.sessionObjectives, 'session'), 'title'),
        'title',
      ).join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-objectives.csv`, csv, 'text/csv');
  });
}

<div
  class="course-visualize-objectives-graph {{unless @isIcon 'not-icon'}}"
  data-test-course-visualize-objectives-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if @isIcon}}
      {{#if this.objectiveWithMinutes.length}}
        <SimpleChart
          @name="donut"
          @isIcon={{@isIcon}}
          @data={{this.objectiveWithMinutes}}
          @hover={{perform this.donutHover}}
          @leave={{perform this.donutHover}}
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
          <div class="with-hours" data-test-with-hours>
            <p>
              {{t "general.objectivesWithNoLink"}}
            </p>
            <h4>
              <FaIcon @icon="meh" class="meh-o" />
            </h4>
          </div>
        {{/if}}
      {{/if}}
    {{else}}
      {{#if this.objectiveWithMinutes.length}}
        <SimpleChart
          @name="donut"
          @isIcon={{@isIcon}}
          @data={{this.objectiveWithMinutes}}
          @hover={{perform this.donutHover}}
          @leave={{perform this.donutHover}}
          as |chart|
        >
          {{#if this.tooltipContent}}
            <chart.tooltip @title={{this.tooltipTitle}}>
              {{this.tooltipContent}}
            </chart.tooltip>
          {{/if}}
        </SimpleChart>
      {{else}}
        <div class="with-hours" data-test-with-hours>
          <p>
            {{t "general.objectivesWithNoLink"}}
          </p>
          <h4>
            <FaIcon @icon="meh" class="meh-o" />
          </h4>
        </div>
      {{/if}}
    {{/if}}
    {{#if (and (not @isIcon) this.objectiveWithoutMinutes.length)}}
      <div class="zero-hours" data-test-zero-hours>
        <h4>
          <FaIcon @icon="triangle-exclamation" class="warning" />
          {{t "general.unusedObjectives"}}:
        </h4>
        <p>
          {{t "general.objectivesWithNoHours"}}
        </p>
        <ul>
          {{#each (sort-by "meta.courseObjective.title" this.objectiveWithoutMinutes) as |obj|}}
            {{! template-lint-disable no-triple-curlies}}
            <li>
              {{{obj.meta.courseObjective.title}}}
            </li>
          {{/each}}
        </ul>
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
                @sortedBy={{or (eq this.sortBy "percentage") (eq this.sortBy "percentage:desc")}}
                @onClick={{fn this.setSortBy "percentage"}}
                @sortType="numeric"
                data-test-percentage
              >
                {{t "general.percentage"}}
              </SortableTh>
              <SortableTh
                @colspan="3"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq this.sortBy "objective") (eq this.sortBy "objective:desc")}}
                @onClick={{fn this.setSortBy "objective"}}
                data-test-objective
              >
                {{t "general.courseObjective"}}
              </SortableTh>
              <SortableTh
                @colspan="2"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or
                  (eq this.sortBy "competencies")
                  (eq this.sortBy "competencies:desc")
                }}
                @onClick={{fn this.setSortBy "competencies"}}
                data-test-competencies
              >
                {{t "general.competencies"}}
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
                <td data-test-percentage>{{row.percentageLabel}}</td>
                <td class="objective-row" colspan="3" data-test-objective>{{{row.objective}}}</td>
                <td colspan="2" data-test-competencies>{{row.competencies}}</td>
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