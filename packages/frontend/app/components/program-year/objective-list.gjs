import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import ObjectiveSortManager from 'ilios-common/components/objective-sort-manager';
import set from 'ember-set-helper/helpers/set';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import gt from 'ember-truth-helpers/helpers/gt';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import isArray from 'ember-truth-helpers/helpers/is-array';
import ObjectiveListItem from 'frontend/components/program-year/objective-list-item';
import ObjectiveListLoading from 'frontend/components/program-year/objective-list-loading';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

export default class ProgramYearObjectiveListComponent extends Component {
  @service iliosConfig;
  @service session;

  @tracked isSorting = false;

  @cached
  get programYearCompetenciesData() {
    return new TrackedAsyncData(this.args.programYear.competencies);
  }

  @cached
  get programYearCompetencies() {
    return this.programYearCompetenciesData.isResolved
      ? this.programYearCompetenciesData.value
      : [];
  }

  @cached
  get domainTreesData() {
    return new TrackedAsyncData(this.getDomainTrees(this.programYearCompetencies));
  }

  get domainTrees() {
    return this.domainTreesData.isResolved ? this.domainTreesData.value : [];
  }

  @cached
  get programYearObjectivesData() {
    return new TrackedAsyncData(this.args.programYear.programYearObjectives);
  }

  get sortedProgramYearObjectives() {
    return this.programYearObjectivesData.isResolved
      ? this.programYearObjectivesData.value.toSorted(sortableByPosition)
      : [];
  }

  get programYearObjectiveCount() {
    return this.args.programYear.programYearObjectives.length;
  }

  async getDomainTrees(programYearCompetencies) {
    const domains = programYearCompetencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
    const parents = await Promise.all(mapBy(programYearCompetencies, 'parent'));
    const allDomains = uniqueValues([...domains, ...parents]).filter(Boolean);
    return await map(allDomains, async (domain) => {
      const competencies = (await domain.children).map((competency) => {
        return {
          id: competency.id,
          title: competency.title,
        };
      });
      return {
        id: domain.id,
        title: domain.title,
        competencies,
      };
    });
  }

  get authHeaders() {
    const headers = {};
    if (this.session?.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    return new Headers(headers);
  }

  downloadReport = task({ drop: true }, async () => {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = `/programyears/${this.args.programYear.id}/downloadobjectivesmapping`;
    const host = this.iliosConfig.apiHost ?? `${window.location.protocol}//${window.location.host}`;
    const url = host + apiPath + resourcePath;
    const { default: saveAs } = await import('file-saver');
    const response = await fetch(url, {
      headers: this.authHeaders,
    });
    const blob = await response.blob();
    saveAs(blob, 'report.csv');
  });

  expandAll = task({ drop: true }, async () => {
    await timeout(100);
    this.args.toggleExpandAll();
  });
  <template>
    <div class="program-year-objective-list" data-test-program-year-objective-list>
      {{#if this.isSorting}}
        <ObjectiveSortManager @subject={{@programYear}} @close={{set this "isSorting" false}} />
      {{/if}}

      {{#if (and this.programYearObjectiveCount (not this.isSorting))}}
        {{#if (gt this.programYearObjectiveCount 1)}}
          <button
            class="sort-button"
            type="button"
            {{on "click" (set this "isSorting" true)}}
            data-test-sort
          >
            {{t "general.sortObjectives"}}
          </button>
        {{/if}}

        <button type="button" class="download" {{on "click" (perform this.downloadReport)}}>
          <FaIcon
            @icon={{if this.downloadReport.isRunning "spinner" "download"}}
            @spin={{this.downloadReport.isRunning}}
          />
          {{t "general.downloadCompetencyMap"}}
        </button>

        <div class="grid-row headers" data-test-headers>
          <span class="grid-item">
            <button
              type="button"
              class="link-button"
              disabled={{this.expandAll.isRunning}}
              aria-label={{if @allObjectivesExpanded (t "general.collapse") (t "general.expand")}}
              {{on "click" (perform this.expandAll)}}
            >
              {{#if this.expandAll.isRunning}}
                <LoadingSpinner />
              {{else if @allObjectivesExpanded}}
                <FaIcon @icon={{faCaretDown}} class="clickable" />
              {{else}}
                <FaIcon @icon={{faCaretRight}} class="clickable" />
              {{/if}}
            </button>
          </span>
          <span class="grid-item" data-test-header>{{t "general.description"}}</span>
          <span class="grid-item" data-test-header>{{t "general.competency"}}</span>
          <span class="grid-item" data-test-header>{{t "general.vocabularyTerms"}}</span>
          <span class="grid-item" data-test-header>{{t "general.meshTerms"}}</span>
          <span class="actions grid-item" data-test-header>{{t "general.actions"}}</span>
        </div>
        {{#if (isArray this.domainTrees)}}
          {{#each this.sortedProgramYearObjectives as |programYearObjective|}}
            <ObjectiveListItem
              @programYearObjective={{programYearObjective}}
              @editable={{@editable}}
              @domainTrees={{this.domainTrees}}
              @programYearCompetencies={{this.programYearCompetencies}}
              @expandedObjectiveIds={{@expandedObjectiveIds}}
              @setExpandedObjectiveIds={{@setExpandedObjectiveIds}}
            />
          {{/each}}
        {{else}}
          <ObjectiveListLoading @count={{this.programYearObjectiveCount}} />
        {{/if}}
      {{/if}}
    </div>
  </template>
}
