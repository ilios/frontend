import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import includes from 'ilios-common/helpers/includes';
import capitalize from 'ilios-common/helpers/capitalize';
import formatDate from 'ember-intl/helpers/format-date';
import { pageTitle } from 'ember-page-title';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const DEBOUNCE_DELAY = 250;

export default class CourseMaterialsComponent extends Component {
  @service dataLoader;
  @service store;
  @tracked courseQuery;
  @tracked sessionQuery;

  typesWithUrl = ['file', 'link'];

  @cached
  get courseMaterialsData() {
    return new TrackedAsyncData(this.args.course.learningMaterials);
  }

  @cached
  get courseSessionsData() {
    return new TrackedAsyncData(this.dataLoader.loadCourseSessions(this.args.course.id));
  }

  @cached
  get sessionMaterialsData() {
    if (!this.courseSessionsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this.courseSessionsData.value.map((s) => s.learningMaterials)),
    );
  }

  @cached
  get sessionMaterialLmsData() {
    if (!this.sessionMaterialsData?.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this.sessionMaterialsData.value.flat().map((s) => s.learningMaterial)),
    );
  }

  @cached
  get courseMaterialLmsData() {
    if (!this.courseMaterialsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this.courseMaterialsData.value.map((c) => c.learningMaterial)),
    );
  }

  /**
   * Resolve session and LMs, so they can be used synchronous
   * in the filter.
   */
  get sessionMaterialObjects() {
    if (!this.sessionMaterialsData?.isResolved || !this.sessionMaterialLmsData?.isResolved) {
      return null;
    }

    return this.sessionMaterialsData.value.flat().map((slm) => {
      const lm = this.store.peekRecord('learning-material', slm.belongsTo('learningMaterial').id());
      const session = this.store.peekRecord('session', slm.belongsTo('session').id());
      return {
        session,
        lm,
      };
    });
  }

  get isLoading() {
    return !this.courseMaterialLmsData?.isResolved || !this.sessionMaterialLmsData?.isResolved;
  }

  get filteredCourseLearningMaterials() {
    if (!this.courseMaterialLmsData?.isResolved) {
      return [];
    }
    const q = cleanQuery(this.courseQuery);
    if (!q) {
      return this.courseMaterialLmsData.value;
    }
    const exp = new RegExp(q, 'gi');
    return this.courseMaterialLmsData.value.filter((obj) => {
      return (
        (obj.title && obj.title.match(exp)) ||
        (obj.description && obj.description.match(exp)) ||
        (obj.originalAuthor && obj.originalAuthor.match(exp)) ||
        (obj.type && obj.type.match(exp)) ||
        (obj.citation && obj.citation.match(exp))
      );
    });
  }

  get filteredSessionLearningMaterialObjects() {
    if (!this.sessionMaterialObjects) {
      return [];
    }
    const q = cleanQuery(this.sessionQuery);
    if (!q) {
      return this.sessionMaterialObjects;
    }
    const exp = new RegExp(q, 'gi');
    return this.sessionMaterialObjects.filter((obj) => {
      return (
        (obj.lm.title && obj.lm.title.match(exp)) ||
        (obj.lm.description && obj.lm.description.match(exp)) ||
        (obj.lm.originalAuthor && obj.lm.originalAuthor.match(exp)) ||
        (obj.lm.type && obj.lm.type.match(exp)) ||
        (obj.lm.citation && obj.lm.citation.match(exp)) ||
        (obj.session.title && obj.session.title.match(exp))
      );
    });
  }

  get clmSortedAscending() {
    return this.args.courseSort.search(/desc/) === -1;
  }

  get slmSortedAscending() {
    return this.args.sessionSort.search(/desc/) === -1;
  }

  @action
  courseSortBy(prop) {
    if (this.args.courseSort === prop) {
      prop += ':desc';
    }
    this.args.onCourseSort(prop);
  }

  @action
  sessionSortBy(prop) {
    if (this.args.sessionSort === prop) {
      prop += ':desc';
    }
    this.args.onSessionSort(prop);
  }

  setCourseQuery = task({ restartable: true }, async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.courseQuery = q;
  });

  setSessionQuery = task({ restartable: true }, async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.sessionQuery = q;
  });
  <template>
    {{pageTitle
      (t "general.courses")
      " | "
      @course.title
      " | "
      (t "general.courseLearningMaterials")
    }}

    <div class="course-materials" data-test-course-materials>
      <div class="material-list">
        <h3 class="course-material-title">
          {{t "general.courseLearningMaterials"}}
          (<span
            data-test-course-materials-count
          >{{this.filteredCourseLearningMaterials.length}}</span>)
        </h3>
        <span class="filter-course-lms">
          <input
            aria-label={{t "general.filterPlaceholder"}}
            placeholder={{t "general.filterPlaceholder"}}
            value={{this.courseQuery}}
            {{on "input" (perform this.setCourseQuery value="target.value")}}
            data-test-course-filter
          />
        </span>
        <table class="ilios-table ilios-table-colors" data-test-course-table>
          <thead>
            <tr>
              <SortableTh
                @colspan={{4}}
                @sortedAscending={{this.clmSortedAscending}}
                @sortedBy={{or (eq @courseSort "title") (eq @courseSort "title:desc")}}
                @onClick={{fn this.courseSortBy "title"}}
              >
                {{t "general.title"}}
              </SortableTh>
              <SortableTh
                @sortedAscending={{this.clmSortedAscending}}
                @sortedBy={{or (eq @courseSort "type") (eq @courseSort "type:desc")}}
                @onClick={{fn this.courseSortBy "type"}}
              >
                {{t "general.type"}}
              </SortableTh>
              <SortableTh
                @sortedAscending={{this.clmSortedAscending}}
                @sortedBy={{or
                  (eq @courseSort "originalAuthor")
                  (eq @courseSort "originalAuthor:desc")
                }}
                @onClick={{fn this.courseSortBy "originalAuthor"}}
              >
                {{t "general.author"}}
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {{#if this.isLoading}}
              <tr>
                <td colspan="6" align="center">
                  <FaIcon
                    @icon={{faSpinner}}
                    class="orange"
                    @size="2x"
                    @spin={{true}}
                    data-test-loading
                  />
                </td>
              </tr>
            {{else}}
              {{#each
                (sortBy @courseSort this.filteredCourseLearningMaterials)
                as |learningMaterial|
              }}
                <tr>
                  <td colspan="4">
                    {{#if (includes learningMaterial.type this.typesWithUrl)}}
                      <a href={{learningMaterial.url}} rel="noopener noreferrer" target="_blank">
                        {{learningMaterial.title}}
                      </a>
                    {{else}}
                      {{learningMaterial.title}}
                      <br />
                      <small>
                        {{learningMaterial.citation}}
                      </small>
                    {{/if}}
                  </td>
                  <td>
                    {{capitalize learningMaterial.type}}
                  </td>
                  <td>
                    {{learningMaterial.originalAuthor}}
                  </td>
                </tr>
              {{else}}
                <tr>
                  <td colspan="6" align="center">
                    {{if
                      this.courseQuery
                      (t "general.noResultsFound")
                      (t "general.noCourseLearningMaterialsAvailable")
                    }}
                  </td>
                </tr>
              {{/each}}
            {{/if}}
          </tbody>
        </table>
      </div>
      <div class="material-list">
        <h3 class="session-material-title">
          {{t "general.sessionLearningMaterials"}}
          (<span
            data-test-session-materials-count
          >{{this.filteredSessionLearningMaterialObjects.length}}</span>)
        </h3>
        <span class="filter-session-lms">
          <input
            aria-label={{t "general.filterPlaceholder"}}
            placeholder={{t "general.filterPlaceholder"}}
            value={{this.sessionQuery}}
            {{on "input" (perform this.setSessionQuery value="target.value")}}
            data-test-session-filter
          />
        </span>
        <table class="ilios-table ilios-table-colors" data-test-session-table>
          <thead>
            <tr>
              <SortableTh
                @colspan={{3}}
                @sortedAscending={{this.slmSortedAscending}}
                @sortedBy={{or (eq @sessionSort "lm.title") (eq @sessionSort "lm.title:desc")}}
                @onClick={{fn this.sessionSortBy "lm.title"}}
              >
                {{t "general.title"}}
              </SortableTh>
              <SortableTh
                @colspan={{1}}
                @sortedAscending={{this.slmSortedAscending}}
                @sortedBy={{or (eq @sessionSort "lm.type") (eq @sessionSort "lm.type:desc")}}
                @onClick={{fn this.sessionSortBy "lm.type"}}
              >
                {{t "general.type"}}
              </SortableTh>
              <SortableTh
                @colspan={{1}}
                @sortedAscending={{this.slmSortedAscending}}
                @sortedBy={{or
                  (eq @sessionSort "lm.originalAuthor")
                  (eq @sessionSort "lm.originalAuthor:desc")
                }}
                @onClick={{fn this.sessionSortBy "lm.originalAuthor"}}
              >
                {{t "general.author"}}
              </SortableTh>
              <SortableTh
                @colspan={{3}}
                @sortedAscending={{this.slmSortedAscending}}
                @sortedBy={{or
                  (eq @sessionSort "session.title")
                  (eq @sessionSort "session.title:desc")
                }}
                @onClick={{fn this.sessionSortBy "session.title"}}
              >
                {{t "general.session"}}
              </SortableTh>
              <SortableTh
                @colspan={{1}}
                @sortedAscending={{this.slmSortedAscending}}
                @sortedBy={{or
                  (eq @sessionSort "session.firstOfferingDate")
                  (eq @sessionSort "session.firstOfferingDate:desc")
                }}
                @sortType="numeric"
                @onClick={{fn this.sessionSortBy "session.firstOfferingDate"}}
              >
                {{t "general.firstOffering"}}
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {{#if this.isLoading}}
              <tr>
                <td colspan="9" align="center">
                  <FaIcon @icon={{faSpinner}} class="orange" @size="2x" @spin={{true}} />
                </td>
              </tr>
            {{else}}
              {{#each
                (sortBy @sessionSort this.filteredSessionLearningMaterialObjects)
                as |lmObject|
              }}
                <tr>
                  <td colspan="3">
                    {{#if (includes lmObject.lm.type this.typesWithUrl)}}
                      <a href={{lmObject.lm.url}} rel="noopener noreferrer" target="_blank">
                        {{lmObject.lm.title}}
                      </a>
                    {{else}}
                      {{lmObject.lm.title}}
                      <br />
                      <small>
                        {{lmObject.lm.citation}}
                      </small>
                    {{/if}}
                  </td>
                  <td>
                    {{capitalize lmObject.lm.type}}
                  </td>
                  <td>
                    {{lmObject.lm.originalAuthor}}
                  </td>
                  <td colspan="3">
                    {{lmObject.session.title}}
                  </td>
                  <td>
                    {{#if lmObject.session.firstOfferingDate}}
                      {{formatDate
                        lmObject.session.firstOfferingDate
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      }}
                    {{else}}
                      {{t "general.none"}}
                    {{/if}}
                  </td>
                </tr>
              {{else}}
                <tr>
                  <td colspan="9" align="center">
                    {{if
                      this.sessionQuery
                      (t "general.noResultsFound")
                      (t "general.noSessionLearningMaterialsAvailable")
                    }}
                  </td>
                </tr>
              {{/each}}
            {{/if}}
          </tbody>
        </table>
      </div>
    </div>
  </template>
}
