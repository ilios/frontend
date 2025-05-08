import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

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
}

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
        <label for="supplemental-curriculum-{{@templateId}}">
          {{t "general.supplementalCurriculum"}}:
        </label>
        <div>
          <input
            id="supplemental-curriculum-{{@templateId}}"
            type="checkbox"
            checked={{@session.supplemental}}
            disabled="disabled"
          />
        </div>
      </div>
      <div class="inline-label-data-block">
        <label for="special-attire-{{@templateId}}">
          {{t "general.specialAttireRequired"}}:
        </label>
        <div>
          <input
            id="special-attire-{{@templateId}}"
            type="checkbox"
            checked={{@session.attireRequired}}
            disabled="disabled"
          />
        </div>
      </div>
      <div class="inline-label-data-block">
        <label for="special-equipment-{{@templateId}}">
          {{t "general.specialEquipmentRequired"}}:
        </label>
        <div>
          <input
            id="special-equipment-{{@templateId}}"
            type="checkbox"
            checked={{@session.equipmentRequired}}
            disabled="disabled"
          />
        </div>
      </div>
      <div class="inline-label-data-block">
        <label for="attendance-{{@templateId}}">
          {{t "general.attendanceRequired"}}:
        </label>
        <div>
          <input
            id="attendance-{{@templateId}}"
            type="checkbox"
            checked={{@session.attendanceRequired}}
            disabled="disabled"
          />
        </div>
      </div>
      <br />
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
        <Session::ObjectiveList @session={{@session}} @editable={{false}} />
      </div>
    {{/if}}
  </section>
  <section class="block" data-test-session-learning-materials>
    <div class="title">
      {{t "general.learningMaterials"}}
      ({{this.learningMaterials.length}})
    </div>
    <div class="content">
      {{#if this.learningMaterials.length}}
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
                  {{remove-html-tags lm.learningMaterial.description}}
                  <p></p>
                  {{lm.learningMaterial.citation}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{/if}}
    </div>
  </section>
  <section class="block" data-test-session-terms>
    <div class="title">
      {{t "general.terms"}}
      ({{this.terms.length}})
    </div>
    <div class="content">
      <div class="content">
        {{#each @session.associatedVocabularies as |vocab|}}
          <DetailTermsList @vocabulary={{vocab}} @terms={{this.terms}} @canEdit={{false}} />
        {{/each}}
      </div>
    </div>
  </section>
  <section class="block">
    <div class="title">
      {{t "general.mesh"}}
      ({{this.meshDescriptors.length}})
    </div>
    <div class="content">
      <ul class="inline-list">
        {{#each (sort-by "title" this.meshDescriptors) as |descriptor|}}
          <li>
            {{descriptor.name}}
          </li>
        {{/each}}
      </ul>
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
                {{format-date
                  @session.ilmSession.dueDate
                  month="2-digit"
                  day="2-digit"
                  year="numeric"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  {{/if}}
  <section class="block">
    <div class="title">
      {{t "general.offerings"}}
      ({{this.offerings.length}})
    </div>
    <div class="content">
      {{#if this.offerings.length}}
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
                  {{format-date
                    offering.startDate
                    month="2-digit"
                    day="2-digit"
                    year="numeric"
                    hour12=true
                    hour="2-digit"
                    minute="2-digit"
                  }}
                  -
                  {{format-date
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
                  <ul>
                    {{#each offering.allInstructors as |user|}}
                      <li>
                        {{user.fullName}}
                      </li>
                    {{/each}}
                  </ul>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{else}}
        <p>
          {{t "general.noOfferings"}}
        </p>
      {{/if}}
    </div>
  </section>
</div>