import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import or from 'ember-truth-helpers/helpers/or';
import SimpleChart from 'ember-simple-charts/components/simple-chart';
import perform from 'ember-concurrency/helpers/perform';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import t from 'ember-intl/helpers/t';
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

export default class CourseVisualizeInstructorTermGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.course, this.args.user));
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

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.vocabularyTerm = `${obj.meta.vocabulary.title} - ${obj.meta.term.title}`;
      rhett.sessionTitles = mapBy(rhett.sessions, 'title').join(', ');
      return rhett;
    });
  }

  get isLoaded() {
    return this.outputData.isResolved;
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

  async getData(course, user) {
    const sessions = await course.sessions;
    if (!sessions.length) {
      return [];
    }
    const sessionsWithUser = await filter(sessions, async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return mapBy(allInstructors, 'id').includes(user.id);
    });

    const sessionsWithTerms = await map(sessionsWithUser, async (session) => {
      const sessionTerms = await session.terms;
      const terms = await map(sessionTerms, async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          term,
          vocabulary,
        };
      });

      return {
        session,
        terms,
      };
    });

    const dataMap = await map(sessionsWithTerms, async ({ session, terms }) => {
      const minutes = await session.getTotalSumDurationByInstructor(this.args.user);
      return terms.map(({ term, vocabulary }) => {
        return {
          session,
          term,
          vocabulary,
          minutes,
        };
      });
    });

    return dataMap
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, { term, session, vocabulary, minutes }) => {
        const label = vocabulary.title + ' - ' + term.title;
        const id = term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label,
            meta: {
              term,
              vocabulary,
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
        ((obj.description = `${obj.meta.vocabulary.title} - ${obj.meta.term.title} - ${
          obj.data
        } ${this.intl.t('general.minutes')}`),
          delete obj.id);
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabulary.title.localeCompare(second.meta.vocabulary.title) ||
          second.data - first.data
        );
      });
  }

  donutHover = task({ restartable: true }, async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    const { data, meta } = obj;

    this.tooltipTitle = htmlSafe(
      `${meta.vocabulary.title} - ${meta.term.title} &bull; ${data} ${this.intl.t(
        'general.minutes',
      )}`,
    );
    this.tooltipContent = htmlSafe(mapBy(meta.sessions, 'title').sort().join(', '));
  });

  downloadData = task({ drop: true }, async () => {
    const data = await this.getData(this.args.course, this.args.user);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.term')}`] = obj.meta.term.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-course-${this.args.course.id}-instructor-${this.args.user.id}-vocabulary-terms.csv`,
      csv,
      'text/csv',
    );
  });
  <template>
    <div
      class="course-visualize-instructor-term-graph {{unless @isIcon 'not-icon'}}"
      data-test-course-visualize-instructor-term-graph
      ...attributes
    >
      {{#if this.isLoaded}}
        {{#if (or @isIcon this.hasChartData)}}
          <SimpleChart
            @name="horz-bar"
            @isIcon={{@isIcon}}
            @data={{this.data}}
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
        {{/if}}
        {{#if (and (not @isIcon) (not this.hasData))}}
          <div class="no-data" data-test-no-data>
            {{t "general.courseVisualizationsInstructorNoData" instructor=@user.fullName}}
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
            <table class="ilios-table ilios-table-colors">
              <thead>
                <tr>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "vocabularyTerm")
                      (eq this.sortBy "vocabularyTerm:desc")
                    }}
                    @onClick={{fn this.setSortBy "vocabularyTerm"}}
                    data-test-vocabulary-term
                  >
                    {{t "general.term"}}
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
                    <td data-test-vocabulary-term>{{row.vocabularyTerm}}</td>
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
