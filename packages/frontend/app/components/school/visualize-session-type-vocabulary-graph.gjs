import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { action } from '@ember/object';
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
import { fn } from '@ember/helper';
import sortBy from 'ilios-common/helpers/sort-by';

export default class SchoolVisualizeSessionTypeVocabularyGraphComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'termTitle';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.sessionType, this.args.vocabulary));
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

  get hasChartData() {
    return this.chartData.length;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.termTitle = obj.label;
      rhett.sessionsCount = obj.data;
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

  async getData(sessionType, vocabulary) {
    const sessions = await sessionType.sessions;
    if (!sessions.length) {
      return [];
    }

    const termsWithSession = await map(sessions, async (session) => {
      const sessionTerms = await session.terms;

      const terms = await filter(sessionTerms, async (term) => {
        const termVocab = await term.vocabulary;
        return termVocab.id === vocabulary.id;
      });

      return terms.map((term) => {
        return {
          term,
          session,
        };
      });
    });

    const termObjects = termsWithSession
      .filter((termsWithSession) => termsWithSession.length)
      .flat()
      .reduce((obj, termWithSession) => {
        const id = termWithSession.term.id;
        if (!(id in obj)) {
          obj[id] = {
            term: termWithSession.term,
            sessionIds: new Set(),
          };
        }
        obj[id].sessionIds.add(termWithSession.session.id);
        return obj;
      }, {});

    const termData = Object.values(termObjects);

    const rhett = await map(termData, async (obj) => {
      const termTitle = await obj.term.getTitleWithParentTitles();
      return {
        data: obj.sessionIds.size,
        label: termTitle,
        description: this.intl.t('general.termXappliedToYSessionsWithSessionTypeZ', {
          term: termTitle,
          vocabulary: vocabulary.title,
          sessionsCount: obj.sessionIds.size,
          sessionType: sessionType.title,
        }),
      };
    });
    return rhett.sort((first, second) => {
      return first.data - second.data;
    });
  }

  donutHover = task({ restartable: true }, async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    this.tooltipTitle = htmlSafe(obj.label);
    this.tooltipContent = obj.description;
  });

  downloadData = task({ drop: true }, async () => {
    const data = await this.getData(this.args.sessionType, this.args.vocabulary);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = this.args.sessionType.title;
      rhett[this.intl.t('general.vocabulary')] = this.args.vocabulary.title;
      rhett[this.intl.t('general.term')] = obj.label;
      rhett[this.intl.t('general.sessions')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-school-${this.args.sessionType.id}-${this.args.vocabulary.id}-session-type-vocabulary.csv`,
      csv,
      'text/csv',
    );
  });
  <template>
    <div
      class="{{unless @isIcon 'not-icon'}} school-visualize-session-type-vocabulary-graph"
      data-test-school-visualize-session-type-vocabulary-graph
      ...attributes
    >
      {{#if this.isLoaded}}
        {{#if (or @isIcon this.hasChartData)}}
          <SimpleChart
            @name="donut"
            @isIcon={{@isIcon}}
            @data={{this.chartData}}
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
            {{t "general.schoolSessionTypeVocabularyVisualizationNoMapping"}}
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
            <table class="ilios-table ilios-table-colors ilios-zebra-table">
              <thead>
                <tr>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or (eq this.sortBy "termTitle") (eq this.sortBy "termTitle:desc")}}
                    @onClick={{fn this.setSortBy "termTitle"}}
                    data-test-term-title
                  >
                    {{t "general.term"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "sessionsCount")
                      (eq this.sortBy "sessionsCount:desc")
                    }}
                    @onClick={{fn this.setSortBy "sessionsCount"}}
                    @sortType="numeric"
                    data-test-sessions-count
                  >
                    {{t "general.sessions"}}
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {{#each (sortBy this.sortBy this.tableData) as |row|}}
                  <tr>
                    <td data-test-term-title>{{row.termTitle}}</td>
                    <td data-test-sessions-count>{{row.sessionsCount}}</td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      {{else}}
        <FaIcon @icon="spinner" @spin={{true}} />
      {{/if}}
    </div>
  </template>
}
