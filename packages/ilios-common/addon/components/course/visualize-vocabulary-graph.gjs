import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
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

export default class CourseVisualizeVocabularyGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.args.course));
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
      rhett.term = obj.meta.term;
      rhett.termTitle = obj.meta.term.title;
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

  async getDataObjects(course) {
    const sessions = await course.sessions;
    if (!sessions.length) {
      return [];
    }
    const sessionsWithMinutes = await map(sessions, async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const termsWithSessionAndMinutes = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const sessionTerms = await session.terms;
        const sessionTermsInThisVocabulary = await filter(sessionTerms, async (term) => {
          const termVocab = await term.vocabulary;
          return termVocab.id === this.args.vocabulary.id;
        });
        return sessionTermsInThisVocabulary.map((term) => {
          return {
            term,
            session,
            minutes,
          };
        });
      },
    );

    return termsWithSessionAndMinutes
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, { term, session, minutes }) => {
        const id = term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: term.title,
            meta: {
              term,
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
        obj.description = `${obj.meta.term.title} - ${obj.data} ${this.intl.t('general.minutes')}`;
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
      `${meta.term.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(mapBy(meta.sessions, 'title').sort().join(', '));
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo('course-visualize-term', this.args.course.id, obj.meta.term.id);
  }

  downloadData = task({ drop: true }, async () => {
    const data = await this.getDataObjects(this.args.course, this.args.vocabulary.id);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.term')}`] = obj.meta.term.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-course-${this.args.course.id}-vocabulary-${this.args.vocabulary.id}`,
      csv,
      'text/csv',
    );
  });
  <template>
    <div
      class="course-visualize-vocabulary-graph {{unless @isIcon 'not-icon'}}"
      data-test-course-visualize-vocabulary-graph
      ...attributes
    >
      {{#if this.isLoaded}}
        {{#if (or @isIcon this.hasChartData)}}
          <SimpleChart
            @name="horz-bar"
            @isIcon={{@isIcon}}
            @data={{this.data}}
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
        {{/if}}
        {{#if (and (not @isIcon) (not this.hasData))}}
          <div class="no-data" data-test-no-data>
            {{t "general.courseVisualizationsVocabularyGraphNoData" vocabulary=@vocabulary.title}}
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
            <table class="ilios-table ilios-zebra-table">
              <thead>
                <tr>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or (eq this.sortBy "termTitle") (eq this.sortBy "termTitle:desc")}}
                    @onClick={{fn this.setSortBy "termTitle"}}
                    data-test-term
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
                    <td data-test-term>
                      <LinkTo
                        @route="course-visualize-term"
                        @models={{array @course.id row.term.id}}
                      >
                        {{row.termTitle}}
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
