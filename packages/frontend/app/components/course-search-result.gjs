import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import GlobalSearchTags from 'frontend/components/global-search-tags';
import { array } from '@ember/helper';
import { gt } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

export default class CourseSearchResultComponent extends Component {
  @tracked showMore = false;

  get filteredSessions() {
    const { sessions } = this.args.course;
    return sessions.filter((s) => s.matchedIn.length);
  }

  get sessions() {
    return this.showMore ? this.filteredSessions : this.filteredSessions.slice(0, 3);
  }
  <template>
    <li class="course-search-result" data-test-course-search-result ...attributes>
      <LinkTo @route="course" @model={{@course.id}} data-test-course-title>
        <small>{{@course.year}}</small>
        {{@course.title}}
      </LinkTo>
      <span class="school-flag" data-test-school-title>
        {{@course.school}}
      </span>
      <span class="course-flag">
        {{t "general.course"}}
      </span>
      <GlobalSearchTags @tags={{@course.matchedIn}} />
      {{#if this.sessions}}
        <ul>
          <li class="sessions">
            {{t "general.sessions"}}:
          </li>
          {{#each this.sessions as |session|}}
            <li class="session-row">
              <LinkTo
                @route="session"
                @models={{array @course.id session.id}}
                class="session-title-link"
              >
                {{session.title}}
              </LinkTo>
              <GlobalSearchTags @tags={{session.matchedIn}} />
            </li>
          {{/each}}
          {{#if (gt this.filteredSessions.length 3)}}
            {{#if this.showMore}}
              <li>
                <button
                  class="show-less link-button"
                  type="button"
                  {{on "click" (set this "showMore" false)}}
                >
                  <FaIcon @icon={{faAngleUp}} />
                  {{t "general.showLess"}}
                </button>
              </li>
            {{else}}
              <li>
                <button
                  class="show-more link-button"
                  type="button"
                  {{on "click" (set this "showMore" true)}}
                >
                  <FaIcon @icon={{faAngleDown}} />
                  {{t "general.showMore"}}
                </button>
              </li>
            {{/if}}
          {{/if}}
        </ul>
      {{/if}}
    </li>
  </template>
}
