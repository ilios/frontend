<div data-test-courses-list ...attributes>
  {{#if @courses.length}}
    <table>
      <thead>
        <tr data-test-course-headings>
          <SortableTh
            data-test-course-title-heading
            @colspan="8"
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
            @onClick={{fn this.setSortBy "title"}}
          >
            {{t "general.courseTitle"}}
          </SortableTh>
          <SortableTh
            class="hide-from-small-screen"
            @align="center"
            @colspan="1"
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "level") (eq @sortBy "level:desc")}}
            @sortType="numeric"
            @onClick={{fn this.setSortBy "level"}}
          >
            {{t "general.level"}}
          </SortableTh>
          <SortableTh
            class="hide-from-small-screen"
            @align="center"
            @colspan="2"
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "startDate") (eq @sortBy "startDate:desc")}}
            @sortType="numeric"
            @onClick={{fn this.setSortBy "startDate"}}
          >
            {{t "general.startDate"}}
          </SortableTh>
          <SortableTh
            class="hide-from-small-screen"
            @align="center"
            @colspan="2"
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "endDate") (eq @sortBy "endDate:desc")}}
            @sortType="numeric"
            @onClick={{fn this.setSortBy "endDate"}}
          >
            {{t "general.endDate"}}
          </SortableTh>
          <SortableTh
            @align="right"
            @colspan="3"
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "status") (eq @sortBy "status:desc")}}
            @onClick={{fn this.setSortBy "status"}}
          >
            {{t "general.status"}}
          </SortableTh>
        </tr>
      </thead>
      <tbody data-test-courses>
        {{#each
          (sort-by (if this.sortingByStatus this.sortCoursesByStatus @sortBy) @courses)
          as |course|
        }}
          <Courses::ListItem
            @course={{course}}
            @coursesForRemovalConfirmation={{this.coursesForRemovalConfirmation}}
            @savingCourseIds={{this.savingCourseIds}}
            @lockCourse={{fn (perform this.lockCourse)}}
            @unlockCourse={{fn (perform this.unlockCourse)}}
            @confirmRemoval={{this.confirmRemoval}}
          />
          {{#if (includes course.id this.coursesForRemovalConfirmation)}}
            <tr class="confirm-removal">
              <ResponsiveTd @smallScreenSpan="10" @largeScreenSpan="15">
                <div class="confirm-message">
                  {{t
                    "general.confirmRemoveCourse"
                    publishedOfferingCount=course.publishedOfferingCount
                  }}
                  <br />
                  <div class="confirm-buttons">
                    <button {{on "click" (fn @remove course)}} type="button" class="remove text">
                      {{t "general.yes"}}
                    </button>
                    <button
                      type="button"
                      class="done text"
                      {{on "click" (fn this.cancelRemove course)}}
                    >
                      {{t "general.cancel"}}
                    </button>
                  </div>
                </div>
              </ResponsiveTd>
            </tr>
          {{/if}}
        {{/each}}
      </tbody>
    </table>
  {{/if}}
</div>