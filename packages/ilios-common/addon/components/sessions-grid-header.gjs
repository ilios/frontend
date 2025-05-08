import Component from '@glimmer/component';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';

export default class SessionsGridHeader extends Component {
  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  expandAll = dropTask(async () => {
    await timeout(100);
    this.args.toggleExpandAll();
  });
}

<div class="sessions-grid-header{{if @headerIsLocked ' locked'}}" data-test-sessions-grid-header>
  <span class="expand-collapse-control" data-test-expand-collapse-all>
    {{#if @showExpandAll}}
      <button
        class="link-button"
        type="button"
        disabled={{this.expandAll.isRunning}}
        {{on "click" (perform this.expandAll)}}
      >
        {{#if this.expandAll.isRunning}}
          <LoadingSpinner />
        {{else if @allSessionsExpanded}}
          <FaIcon @icon="caret-down" class="clickable" />
        {{else}}
          <FaIcon @icon="caret-right" class="clickable" />
        {{/if}}
      </button>
    {{/if}}
  </span>
  <SortableHeading
    @onClick={{fn this.setSortBy "title"}}
    @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.title"}}
    class="session-grid-title"
    data-test-title
  >
    {{t "general.title"}}
  </SortableHeading>
  <SortableHeading
    @onClick={{fn this.setSortBy "sessionTypeTitle"}}
    @sortedBy={{or (eq @sortBy "sessionTypeTitle") (eq @sortBy "sessionTypeTitle:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.type"}}
    class="session-grid-type"
    data-test-session-type
  >
    {{t "general.type"}}
  </SortableHeading>
  <SortableHeading
    @sortType="numeric"
    @onClick={{fn this.setSortBy "learnerGroupCount"}}
    @sortedBy={{or (eq @sortBy "learnerGroupCount") (eq @sortBy "learnerGroupCount:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.groups"}}
    class="session-grid-groups"
    data-test-learner-group-count
  >
    {{t "general.groups"}}
  </SortableHeading>
  <SortableHeading
    @sortType="numeric"
    @onClick={{fn this.setSortBy "objectiveCount"}}
    @sortedBy={{or (eq @sortBy "objectiveCount") (eq @sortBy "objectiveCount:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.objectives"}}
    class="session-grid-objectives"
    data-test-objective-count
  >
    {{t "general.objectives"}}
  </SortableHeading>
  <SortableHeading
    @sortType="numeric"
    @onClick={{fn this.setSortBy "termCount"}}
    @sortedBy={{or (eq @sortBy "termCount") (eq @sortBy "termCount:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.terms"}}
    class="session-grid-terms"
    data-test-term-count
  >
    {{t "general.terms"}}
  </SortableHeading>
  <SortableHeading
    @sortType="numeric"
    @onClick={{fn this.setSortBy "firstOfferingDate"}}
    @sortedBy={{or (eq @sortBy "firstOfferingDate") (eq @sortBy "firstOfferingDate:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.firstOffering"}}
    class="session-grid-first-offering"
    data-test-first-offering
  >
    {{t "general.firstOffering"}}
  </SortableHeading>
  <SortableHeading
    @sortType="numeric"
    @onClick={{fn this.setSortBy "offeringCount"}}
    @sortedBy={{or (eq @sortBy "offeringCount") (eq @sortBy "offeringCount:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.offerings"}}
    class="session-grid-offerings"
    data-test-offering-count
  >
    {{t "general.offerings"}}
  </SortableHeading>
  <SortableHeading
    @onClick={{fn this.setSortBy "status"}}
    @sortedBy={{or (eq @sortBy "status") (eq @sortBy "status:desc")}}
    @sortedAscending={{this.sortedAscending}}
    @title={{t "general.status"}}
    class="session-grid-status"
    data-test-status
  >
    {{t "general.status"}}
  </SortableHeading>
  <span class="session-grid-actions"></span>
</div>