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
    <table data-test-course-table>
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
              <FaIcon @icon="spinner" class="orange" @size="2x" @spin={{true}} data-test-loading />
            </td>
          </tr>
        {{else}}
          {{#each (sort-by @courseSort this.filteredCourseLearningMaterials) as |learningMaterial|}}
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
    <table data-test-session-table>
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
              <FaIcon @icon="spinner" class="orange" @size="2x" @spin={{true}} />
            </td>
          </tr>
        {{else}}
          {{#each (sort-by @sessionSort this.filteredSessionLearningMaterialObjects) as |lmObject|}}
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
                  {{format-date
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