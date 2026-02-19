import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { and, eq, not, or } from 'ember-truth-helpers';
import SimpleChart from 'ember-simple-charts/components/simple-chart';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import { fn, array } from '@ember/helper';
import sortBy from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default class SchoolVisualizeSessionTypeVocabulariesGraphComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'vocabularyTitle';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.sessionType));
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
      rhett.vocabularyTitle = obj.label;
      rhett.vocabularyId = obj.meta.vocabulary.id;
      rhett.termsCount = obj.data;
      rhett.sessionsCount = obj.meta.sessionsCount;
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

  async getData(sessionType) {
    const sessions = await sessionType.sessions;

    if (!sessions.length) {
      return [];
    }

    const sessionsWithTerms = await map(sessions, async (session) => {
      const terms = await session.terms;
      return terms.map((term) => {
        return { session, term };
      });
    });

    const termsWithSessionAndVocabulary = await map(
      sessionsWithTerms.flat(),
      async ({ session, term }) => {
        const vocabulary = await term.vocabulary;
        return {
          term,
          session,
          vocabulary,
        };
      },
    );

    const vocabularyObjects = termsWithSessionAndVocabulary.reduce(
      (vocabularies, { term, session, vocabulary }) => {
        const id = vocabulary.id;
        if (!(id in vocabularies)) {
          vocabularies[id] = {
            vocabulary,
            termIds: new Set(),
            sessionIds: new Set(),
          };
        }
        vocabularies[id].sessionIds.add(session.id);
        vocabularies[id].termIds.add(term.id);
        return vocabularies;
      },
      {},
    );

    const vocabularyData = Object.values(vocabularyObjects);

    return vocabularyData
      .map((obj) => {
        return {
          label: obj.vocabulary.title,
          data: obj.termIds.size,
          description: this.intl.t('general.xTermsFromVocabYusedWithSessionTypeZ', {
            termsCount: obj.termIds.size,
            vocabulary: obj.vocabulary.title,
            sessionsCount: obj.sessionIds.size,
            sessionType: sessionType.title,
          }),
          meta: {
            vocabulary: obj.vocabulary,
            sessionsCount: obj.sessionIds.size,
          },
        };
      })
      .sort((first, second) => {
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

  @action
  donutClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }

    this.router.transitionTo(
      'session-type-visualize-vocabulary',
      this.args.sessionType.id,
      obj.meta.vocabulary.id,
    );
  }

  downloadData = task({ drop: true }, async () => {
    const data = await this.getData(this.args.sessionType);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = this.args.sessionType.title;
      rhett[this.intl.t('general.vocabulary')] = obj.label;
      rhett[this.intl.t('general.terms')] = obj.data;
      rhett[this.intl.t('general.sessions')] = obj.meta.sessionsCount;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-school-${this.args.sessionType.id}-session-type-vocabularies.csv`,
      csv,
      'text/csv',
    );
  });
  <template>
    <div
      class="graph-with-data-table not-icon"
      data-test-school-visualize-session-type-vocabularies-graph
      ...attributes
    >
      {{#if this.isLoaded}}
        {{#if (or @isIcon this.hasChartData)}}
          <SimpleChart
            @name="donut"
            @isIcon={{@isIcon}}
            @data={{this.chartData}}
            @onClick={{this.donutClick}}
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
            {{t "general.schoolSessionTypeVocabulariesVisualizationNoMapping"}}
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
                      (eq this.sortBy "vocabularyTitle")
                      (eq this.sortBy "vocabularyTitle:desc")
                    }}
                    @onClick={{fn this.setSortBy "vocabularyTitle"}}
                    data-test-vocabulary-title
                  >
                    {{t "general.vocabulary"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedAscending}}
                    @sortedBy={{or
                      (eq this.sortBy "termsCount")
                      (eq this.sortBy "termsCount:desc")
                    }}
                    @onClick={{fn this.setSortBy "termsCount"}}
                    @sortType="numeric"
                    data-test-terms-count
                  >
                    {{t "general.terms"}}
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
                    <td data-test-vocabulary-title>
                      <LinkTo
                        @route="session-type-visualize-vocabulary"
                        @models={{array @sessionType.id row.vocabularyId}}
                      >
                        {{row.vocabularyTitle}}
                      </LinkTo>
                    </td>
                    <td data-test-terms-count>{{row.termsCount}}</td>
                    <td data-test-sessions-count>{{row.sessionsCount}}</td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      {{else}}
        <FaIcon @icon={{faSpinner}} @spin={{true}} />
      {{/if}}
    </div>
  </template>
}
