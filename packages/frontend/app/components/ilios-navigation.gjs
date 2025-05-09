import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from 'ilios-common/components/fa-icon';
import { LinkTo } from '@ember/routing';
import join from 'ilios-common/helpers/join';
import { array } from '@ember/helper';

export default class IliosNavigation extends Component {
  @service currentUser;
  @tracked expanded = false;
  <template>
    <nav
      aria-label={{t "general.primary"}}
      class="ilios-navigation {{if this.expanded 'expanded'}}"
      data-test-ilios-navigation
      ...attributes
    >
      {{#if this.currentUser.performsNonLearnerFunction}}
        <ul class="expand-navigation" data-test-expand-navigation>
          <li>
            <button
              type="button"
              class="link-button expander"
              {{on "click" (set this "expanded" (not this.expanded))}}
              data-test-expand-collapse
              aria-haspopup="true"
              aria-expanded={{if this.expanded "true" "false"}}
              aria-label={{if this.expanded (t "general.close") (t "general.expand")}}
            >
              <FaIcon @icon="bars" />
            </button>
          </li>
        </ul>
        <ul class="navigation-links" data-test-navigation-links>
          <li>
            <LinkTo
              @route="dashboard"
              title={{t "general.dashboard"}}
              @current-when={{join " " (array "dashboard" "events" "mymaterials" "weeklyevents")}}
            >
              <FaIcon @icon="house" @fixedWidth={{true}} />
              <span class="text">
                {{t "general.dashboard"}}
              </span>
              <FaIcon class="if-active" @prefix="fas" @icon="chevron-right" @fixedWidth={{true}} />
            </LinkTo>
          </li>
          {{#if this.currentUser.performsNonLearnerFunction}}
            <li>
              <LinkTo
                @route="courses"
                title={{t "general.coursesAndSessions"}}
                @current-when={{join
                  " "
                  (array
                    "course"
                    "course-materials"
                    "course.rollover"
                    "course-visualizations"
                    "course-visualize-instructor"
                    "course-visualize-instructors"
                    "course-visualize-objectives"
                    "course-visualize-session-type"
                    "course-visualize-session-types"
                    "course-visualize-term"
                    "course-visualize-vocabularies"
                    "course-visualize-vocabulary"
                    "courses"
                    "print-course"
                  )
                }}
              >
                <FaIcon @icon="book" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.coursesAndSessions"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
            <li>
              <LinkTo
                @route="learner-groups"
                title={{t "general.learnerGroups"}}
                @current-when="learner-groups learner-group"
              >
                <FaIcon @icon="graduation-cap" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.learnerGroups"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
            <li>
              <LinkTo
                @route="instructor-groups"
                title={{t "general.instructorGroups"}}
                @current-when="instructor-groups instructor-group"
              >
                <FaIcon @icon="user-doctor" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.instructorGroups"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
            <li>
              <LinkTo
                @route="schools"
                title={{t "general.schools"}}
                @current-when="schools school session-type-visualize-vocabularies session-type-visualize-vocabulary"
              >
                <FaIcon @icon="building-columns" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.schools"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
            <li>
              <LinkTo
                @route="programs"
                title={{t "general.programs"}}
                @current-when="programs program program-year-visualize-objectives"
              >
                <FaIcon @icon="rectangle-list" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.programs"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
            <li>
              <LinkTo @route="reports" title={{t "general.reports"}} @current-when="reports">
                <FaIcon @icon="file-lines" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.reports"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
          {{/if}}
          {{#if this.currentUser.canCreateOrUpdateUserInAnySchool}}
            <li>
              <LinkTo
                @route="admin-dashboard"
                title={{t "general.admin"}}
                @current-when="admin-dashboard users user assign-students pending-user-updates"
              >
                <FaIcon @icon="gears" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.admin"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
          {{/if}}
          {{#if this.currentUser.performsNonLearnerFunction}}
            <li>
              <LinkTo
                @route="curriculum-inventory-reports"
                title={{t "general.curriculumInventory"}}
                @current-when={{join
                  " "
                  (array
                    "curriculum-inventory-report"
                    "curriculum-inventory-reports"
                    "curriculum-inventory-sequence-block"
                    "verification-preview"
                  )
                }}
              >
                <FaIcon @icon="chart-column" @fixedWidth={{true}} />
                <span class="text">
                  {{t "general.curriculumInventory"}}
                </span>
                <FaIcon class="if-active" @icon="chevron-right" @fixedWidth={{true}} />
              </LinkTo>
            </li>
          {{/if}}
        </ul>
      {{/if}}
    </nav>
  </template>
}
