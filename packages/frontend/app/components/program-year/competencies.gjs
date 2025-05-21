import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import { fn } from '@ember/helper';
import sortBy from 'ilios-common/helpers/sort-by';
import ManagedCompetencyListItem from 'frontend/components/program-year/managed-competency-list-item';
import or from 'ember-truth-helpers/helpers/or';
import includes from 'ilios-common/helpers/includes';
import mapBy from 'ilios-common/helpers/map-by';
import CompetencyListItem from 'frontend/components/program-year/competency-list-item';

export default class ProgramYearCompetenciesComponent extends Component {
  @service flashMessages;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.programYear));
  }

  @cached
  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get competencies() {
    return this.upstreamRelationships?.competencies || [];
  }

  get programYearCompetencies() {
    return this.upstreamRelationships?.programYearCompetencies || [];
  }

  @cached
  get competenciesWithSelectedChildrenData() {
    return new TrackedAsyncData(
      this.getCompetenciesWithSelectedChildren(this.selectedCompetencies, this.competencies),
    );
  }

  get competenciesWithSelectedChildren() {
    return this.competenciesWithSelectedChildrenData.isResolved
      ? this.competenciesWithSelectedChildrenData.value
      : [];
  }

  get domains() {
    return uniqueValues(this.upstreamRelationships?.domains || []);
  }

  get selectedCompetencies() {
    const filteredCurrent = this.programYearCompetencies.filter((c) => {
      return !this.competenciesToRemove.includes(c);
    });
    return uniqueValues([...this.competenciesToAdd, ...filteredCurrent]);
  }

  async resolveUpstreamRelationships(programYear) {
    const program = await programYear.program;
    const school = await program.school;
    const competencies = await school.competencies;
    const domains = await map(competencies, async (c) => c.getDomain());
    const programYearCompetencies = await programYear.competencies;

    return { program, school, competencies, domains, programYearCompetencies };
  }

  async getCompetenciesWithSelectedChildren(selectedCompetencies, competencies) {
    return await filter(competencies, async (competency) => {
      const children = await competency.children;
      const selectedChildren = children.filter((c) => selectedCompetencies.includes(c));
      return selectedChildren.length > 0;
    });
  }

  @action
  cancel() {
    this.competenciesToAdd = [];
    this.competenciesToRemove = [];
    this.args.setIsManaging(false);
  }

  @action
  addCompetencyToBuffer(competency, children) {
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
    this.competenciesToAdd = [...this.competenciesToAdd, ...children];
    this.competenciesToRemove = this.competenciesToRemove.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @action
  removeCompetencyFromBuffer(competency, children) {
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
    this.competenciesToRemove = [...this.competenciesToRemove, ...children];
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @action
  collapse() {
    if (this.selectedCompetencies.length) {
      this.args.collapse();
    }
  }

  save = task(async () => {
    await timeout(10);
    this.args.programYear.set('competencies', this.selectedCompetencies);
    try {
      await this.args.programYear.save();
    } finally {
      this.flashMessages.success(capitalize('general.savedSuccessfully'));
      this.args.setIsManaging(false);
      this.args.expand();
    }
  });
  <template>
    <div class="program-year-competencies" ...attributes data-test-program-year-competencies>
      <div class="header" data-test-header>
        {{#if @isManaging}}
          <div class="title" data-test-title>
            <span class="specific-title">
              {{t "general.competenciesManageTitle"}}
            </span>
          </div>
        {{else}}
          {{#if this.programYearCompetencies}}
            <button
              class="title link-button"
              type="button"
              aria-expanded="true"
              data-test-title
              {{on "click" @collapse}}
            >
              {{t "general.competencies"}}
              ({{this.programYearCompetencies.length}})
              <FaIcon @icon="caret-down" />
            </button>
          {{else}}
            <div class="title" data-test-title>
              {{t "general.competencies"}}
              ({{this.programYearCompetencies.length}})
            </div>
          {{/if}}
        {{/if}}
        <div class="actions" data-test-actions>
          {{#if @canUpdate}}
            {{#if @isManaging}}
              <button
                type="button"
                class="bigadd"
                {{on "click" (perform this.save)}}
                data-test-save
              >
                <FaIcon
                  @icon={{if this.save.isRunning "spinner" "check"}}
                  @spin={{this.save.isRunning}}
                />
              </button>
              <button type="button" class="bigcancel" {{on "click" this.cancel}} data-test-cancel>
                <FaIcon @icon="arrow-rotate-left" />
              </button>
            {{else}}
              <button type="button" {{on "click" (fn @setIsManaging true)}} data-test-manage>
                {{t "general.competenciesManageTitle"}}
              </button>
            {{/if}}
          {{/if}}
        </div>
      </div>
      <div class="content">
        {{#if @isManaging}}
          <ul class="managed-competency-list" data-test-managed-list>
            {{#each (sortBy "title" this.domains) as |domain|}}
              <ManagedCompetencyListItem
                @domain={{domain}}
                @selectedCompetencies={{this.selectedCompetencies}}
                @competenciesWithSelectedChildren={{this.competenciesWithSelectedChildren}}
                @competencies={{this.competencies}}
                @removeCompetencyFromBuffer={{this.removeCompetencyFromBuffer}}
                @addCompetencyToBuffer={{this.addCompetencyToBuffer}}
              />
            {{/each}}
          </ul>
        {{else if this.programYearCompetencies.length}}
          <ul class="competency-list" data-test-list>
            {{#each (sortBy "title" this.domains) as |domain|}}
              {{#if
                (or
                  (includes domain.id (mapBy "id" this.selectedCompetencies))
                  (includes domain this.competenciesWithSelectedChildren)
                )
              }}
                <CompetencyListItem
                  @domain={{domain}}
                  @selectedCompetencies={{this.selectedCompetencies}}
                  @competencies={{this.competencies}}
                />
              {{/if}}
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </div>
  </template>
}
