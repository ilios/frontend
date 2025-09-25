import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import PublicationStatus from 'ilios-common/components/publication-status';
import t from 'ember-intl/helpers/t';
import ObjectiveList from 'ilios-common/components/session/objective-list';
import removeHtmlTags from 'ilios-common/helpers/remove-html-tags';
import DetailTermsList from 'ilios-common/components/detail-terms-list';
import sortBy from 'ilios-common/helpers/sort-by';
import formatDate from 'ember-intl/helpers/format-date';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import sub_ from 'ember-math-helpers/helpers/sub';
import { guidFor } from '@ember/object/internals';

export default class PrintCourseSessionComponent extends Component {
  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  @cached
  get learningMaterialsData() {
    return new TrackedAsyncData(this.args.session.learningMaterials);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.session.meshDescriptors);
  }

  @cached
  get offeringsData() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.session.terms);
  }

  @cached
  get prerequisitesData() {
    return new TrackedAsyncData(this.args.session.prerequisites);
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : [];
  }

  get learningMaterials() {
    return this.learningMaterialsData.isResolved ? this.learningMaterialsData.value : [];
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  get offerings() {
    return this.offeringsData.isResolved ? this.offeringsData.value : [];
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  get prerequisites() {
    return this.prerequisitesData.isResolved ? this.prerequisitesData.value : null;
  }

  get uniqueId() {
    return guidFor(this);
  }
  <template>
    <div class="print-course-session" data-test-print-course-session>
      <div class="header" data-test-session-header>
        <h2>
          {{@session.title}}
        </h2>
        <PublicationStatus @item={{@session}} />
      </div>
      <section class="overview block">
        <div class="title">
          {{t "general.overview"}}
        </div>
        <div class="content">
          <div class="inline-label-data-block">
            <label>
              {{t "general.sessionType"}}:
            </label>
            <div>
              {{@session.sessionType.title}}
            </div>
          </div>
          <br />
          <div class="inline-label-data-block">
            <label for="supplemental-curriculum-{{this.uniqueId}}">
              {{t "general.supplementalCurriculum"}}:
            </label>
            <div>
              <input
                id="supplemental-curriculum-{{this.uniqueId}}"
                type="checkbox"
                checked={{@session.supplemental}}
                disabled="disabled"
              />
            </div>
          </div>
          <div class="inline-label-data-block">
            <label for="special-attire-{{this.uniqueId}}">
              {{t "general.specialAttireRequired"}}:
            </label>
            <div>
              <input
                id="special-attire-{{this.uniqueId}}"
                type="checkbox"
                checked={{@session.attireRequired}}
                disabled="disabled"
              />
            </div>
          </div>
          <div class="inline-label-data-block">
            <label for="special-equipment-{{this.uniqueId}}">
              {{t "general.specialEquipmentRequired"}}:
            </label>
            <div>
              <input
                id="special-equipment-{{this.uniqueId}}"
                type="checkbox"
                checked={{@session.equipmentRequired}}
                disabled="disabled"
              />
            </div>
          </div>
          <div class="inline-label-data-block">
            <label for="attendance-{{this.uniqueId}}">
              {{t "general.attendanceRequired"}}:
            </label>
            <div>
              <input
                id="attendance-{{this.uniqueId}}"
                type="checkbox"
                checked={{@session.attendanceRequired}}
                disabled="disabled"
              />
            </div>
          </div>
          <div class="inline-label-data-block">
            <label for="attendance-{{this.uniqueId}}">
              {{t "general.independentLearning"}}:
            </label>
            <div>
              <input
                id="independent-learning-{{this.uniqueId}}"
                type="checkbox"
                checked={{@session.isIndependentLearning}}
                disabled="disabled"
              />
            </div>
          </div>
        </div>
      </section>
      {{#if @session.isIndependentLearning}}
        <section class="block" data-test-session-ilm-section>
          <div class="title">
            {{t "general.independentLearning"}}
          </div>
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th>
                    {{t "general.hours"}}
                  </th>
                  <th>
                    {{t "general.dueBy"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {{@session.ilmSession.hours}}
                  </td>
                  <td>
                    {{formatDate
                      @session.ilmSession.dueDate
                      month="2-digit"
                      day="2-digit"
                      year="numeric"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
            {{#if @session.hasPrerequisites}}
              <div class="inline-label-data-block">
                <label>{{t "general.prerequisites"}}:</label>
                <span>
                  {{#each this.prerequisites as |prerequisite index|~}}
                    {{prerequisite.title}}{{#if (notEq index (sub_ this.prerequisites.length 1))}},
                    {{/if}}
                  {{~/each}}
                </span>
              </div>
            {{/if}}
          </div>
        </section>
      {{/if}}
      <section class="block" data-test-session-description>
        <div class="content">
          <div class="inline-label-data-block">
            <label>
              {{t "general.description"}}:
            </label>
            <div>
              {{@session.textDescription}}
            </div>
          </div>
        </div>
      </section>
      <section class="block" data-test-session-objectives>
        <div class="title">
          {{t "general.objectives"}}
          ({{this.sessionObjectives.length}})
        </div>
        {{#if this.sessionObjectives.length}}
          <div class="content">
            <ObjectiveList @session={{@session}} @editable={{false}} />
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-session-learning-materials>
        <div class="title">
          {{t "general.learningMaterials"}}
          ({{this.learningMaterials.length}})
        </div>
        {{#if this.learningMaterials.length}}
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th class="text-left" colspan="2">
                    {{t "general.displayName"}}
                  </th>
                  <th class="text-center">
                    {{t "general.type"}}
                  </th>
                  <th class="text-center">
                    {{t "general.required"}}
                  </th>
                  <th class="text-left">
                    {{t "general.notes"}}
                  </th>
                  <th class="text-left" colspan="4">
                    {{t "general.description"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.learningMaterials as |lm|}}
                  <tr>
                    <td class="text-left text-top" colspan="2">
                      {{lm.learningMaterial.title}}
                    </td>
                    <td class="text-center text-top">
                      {{lm.learningMaterial.type}}
                    </td>
                    <td class="text-center text-top">
                      {{#if lm.required}}
                        <span class="add">
                          {{t "general.yes"}}
                        </span>
                      {{else}}
                        <span class="remove">
                          {{t "general.no"}}
                        </span>
                      {{/if}}
                    </td>
                    <td class="text-left text-top">
                      {{lm.learningMaterial.notes}}
                    </td>
                    <td class="text-left text-top" colspan="4">
                      {{removeHtmlTags lm.learningMaterial.description}}
                      <p></p>
                      {{lm.learningMaterial.citation}}
                    </td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-session-terms>
        <div class="title">
          {{t "general.terms"}}
          ({{this.terms.length}})
        </div>
        {{#if @session.associatedVocabularies.length}}
          <div class="content">
            {{#each @session.associatedVocabularies as |vocab|}}
              <DetailTermsList @vocabulary={{vocab}} @terms={{this.terms}} @canEdit={{false}} />
            {{/each}}
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-session-mesh-terms>
        <div class="title">
          {{t "general.mesh"}}
          ({{this.meshDescriptors.length}})
        </div>
        {{#if this.meshDescriptors.length}}
          <div class="content">
            <ul class="inline-list">
              {{#each (sortBy "title" this.meshDescriptors) as |descriptor|}}
                <li>
                  {{descriptor.name}}
                </li>
              {{/each}}
            </ul>
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-session-offerings>
        <div class="title">
          {{t "general.offerings"}}
          ({{this.offerings.length}})
        </div>
        {{#if this.offerings.length}}
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th class="text-left">
                    {{t "general.time"}}
                  </th>
                  <th class="text-left">
                    {{t "general.location"}}
                  </th>
                  <th class="text-left">
                    {{t "general.instructors"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.offerings as |offering|}}
                  <tr>
                    <td class="text-left">
                      {{formatDate
                        offering.startDate
                        month="2-digit"
                        day="2-digit"
                        year="numeric"
                        hour12=true
                        hour="2-digit"
                        minute="2-digit"
                      }}
                      -
                      {{formatDate
                        offering.endDate
                        month="2-digit"
                        day="2-digit"
                        year="numeric"
                        hour12=true
                        hour="2-digit"
                        minute="2-digit"
                      }}
                    </td>
                    <td class="text-left">
                      {{offering.room}}
                    </td>
                    <td class="text-left offering-instructors">
                      {{#if offering.allInstructors.length}}
                        <ul>
                          {{#each offering.allInstructors as |user|}}
                            <li>
                              {{user.fullName}}
                            </li>
                          {{/each}}
                        </ul>
                      {{/if}}
                    </td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      </section>
    </div>
  </template>
}
