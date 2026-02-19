import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { TrackedAsyncData } from 'ember-async-data';
import add from 'ember-math-helpers/helpers/add';
import PublicationStatus from 'ilios-common/components/publication-status';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import { sortBy as sortArrayBy } from 'ilios-common/utils/array-helpers';
import { and } from 'ember-truth-helpers';
import sortBy from 'ilios-common/helpers/sort-by';
import DetailTermsList from 'ilios-common/components/detail-terms-list';
import ObjectiveList from 'ilios-common/components/course/objective-list';
import removeHtmlTags from 'ilios-common/helpers/remove-html-tags';
import PrintCourseSession from 'ilios-common/components/print-course-session';

export default class PrintCourseComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked sortTitle;
  @tracked sortDirectorsBy;

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @cached
  get competenciesData() {
    return new TrackedAsyncData(this.args.course.competencies);
  }

  @cached
  get directorsData() {
    return new TrackedAsyncData(this.args.course.directors);
  }

  @cached
  get courseLearningMaterialsRelationshipData() {
    return new TrackedAsyncData(this.args.course.learningMaterials);
  }

  @cached
  get sessionsRelationshipData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.course.meshDescriptors);
  }

  get competencies() {
    return this.competenciesData.isResolved ? this.competenciesData.value : [];
  }

  get directors() {
    return this.directorsData.isResolved
      ? sortArrayBy(this.directorsData.value, 'fullName')
          .map((director) => director.fullName)
          .join(', ')
      : '';
  }

  get courseLearningMaterialsRelationship() {
    return this.courseLearningMaterialsRelationshipData.isResolved
      ? this.courseLearningMaterialsRelationshipData.value
      : null;
  }

  get sessionsRelationship() {
    return this.sessionsRelationshipData.isResolved ? this.sessionsRelationshipData.value : null;
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.course.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  get courseLearningMaterials() {
    if (!this.courseLearningMaterialsRelationship) {
      return [];
    }

    return this.courseLearningMaterialsRelationship.toSorted(sortableByPosition);
  }

  get sessions() {
    if (!this.sessionsRelationship) {
      return [];
    }

    if (!this.args.includeUnpublishedSessions) {
      return this.sessionsRelationship.filter((session) => session.isPublishedOrScheduled);
    }

    return this.sessionsRelationship;
  }
  <template>
    <section class="print-course" ...attributes>
      <div class="header" data-test-course-header>
        <h2 data-test-course-title>
          {{@course.title}}
        </h2>
        <h3 data-test-course-year>
          {{#if this.academicYearCrossesCalendarYearBoundaries}}
            {{@course.year}}
            -
            {{add @course.year 1}}
          {{else}}
            {{@course.year}}
          {{/if}}
        </h3>
        <PublicationStatus @item={{@course}} @showText={{true}} />
      </div>
      <section class="overview block" data-test-course-overview>
        <div class="title">
          {{t "general.overview"}}
        </div>
        <div class="content">
          <div class="inline-label-data-block">
            <label>
              {{t "general.start"}}:
            </label>
            <div>
              {{formatDate @course.startDate day="2-digit" month="2-digit" year="numeric"}}
            </div>
          </div>
          <div class="inline-label-data-block">
            <label>
              {{t "general.externalId"}}:
            </label>
            <div>
              {{@course.externalId}}
            </div>
          </div>
          <div class="inline-label-data-block">
            <label>
              {{t "general.level"}}:
            </label>
            <div>
              {{@course.level}}
            </div>
          </div>
          <div class="inline-label-data-block">
            <label>
              {{t "general.end"}}:
            </label>
            <div>
              {{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}
            </div>
          </div>
          <div class="inline-label-data-block">
            <label>
              {{t "general.clerkshipType"}}:
            </label>
            <div>
              {{#if @course.clerkshipType}}
                {{@course.clerkshipType.title}}
              {{else}}
                {{t "general.notAClerkship"}}
              {{/if}}
            </div>
          </div>
          <br />
          <br />
          <div class="inline-label-data-block">
            <label>
              {{t "general.directors"}}:
            </label>
            {{#if (and this.directorsData.isResolved this.directorsData.value.length)}}
              <div>
                <span>{{this.directors}}</span>
              </div>
            {{/if}}
          </div>
        </div>
      </section>
      <section class="block" data-test-course-competencies>
        <div class="title">
          {{t "general.competencies"}}
          ({{this.competencies.length}})
        </div>
        {{#if this.competencies.length}}
          <div class="content">
            <ul class="static-list">
              {{#each @course.domainsWithSubcompetencies as |domain|}}
                <li>
                  {{domain.title}}
                  {{#if domain.subCompetencies}}
                    <ul>
                      {{#each domain.subCompetencies as |competency|}}
                        <li>
                          {{competency.title}}
                        </li>
                      {{/each}}
                    </ul>
                  {{/if}}
                </li>
              {{/each}}
            </ul>
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-course-terms>
        <div class="title">
          {{t "general.terms"}}
          ({{@course.terms.length}})
        </div>
        {{#if @course.associatedVocabularies.length}}
          <div class="content">
            {{#each @course.associatedVocabularies as |vocab|}}
              <DetailTermsList @vocabulary={{vocab}} @terms={{this.terms}} @canEdit={{false}} />
            {{/each}}
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-course-objectives>
        <div class="title">
          {{t "general.objectives"}}
          ({{@course.courseObjectives.length}})
        </div>
        {{#if @course.courseObjectives.length}}
          <div class="content">
            <ObjectiveList @course={{@course}} @editable={{false}} @printable={{true}} />
          </div>
        {{/if}}
      </section>
      <section class="block" data-test-course-learningmaterials>
        <div class="title">
          {{t "general.learningMaterials"}}
          ({{this.courseLearningMaterials.length}})
        </div>
        {{#if this.courseLearningMaterials}}
          <div class="content">
            <table class="ilios-table">
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
                  <th class="text-left description" colspan="4">
                    {{t "general.description"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.courseLearningMaterials as |lm|}}
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
                      {{#if lm.notes}}
                        <span class="add">
                          {{t "general.yes"}}
                        </span>
                      {{else}}
                        <span class="remove">
                          {{t "general.no"}}
                        </span>
                      {{/if}}
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
      <section class="block" data-test-course-mesh>
        <div class="title">
          {{t "general.mesh"}}
          ({{@course.meshDescriptors.length}})
        </div>
        {{#if @course.meshDescriptors.length}}
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
      {{#each (sortBy "title" this.sessions) as |session|}}
        <PrintCourseSession @session={{session}} @editable={{false}} />
      {{/each}}
    </section>
  </template>
}
