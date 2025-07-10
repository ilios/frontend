import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import GlobalSearchTags from 'frontend/components/global-search-tags';
import { array } from '@ember/helper';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import gt from 'ember-truth-helpers/helpers/gt';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';

export default class CourseSearchResultComponent extends Component {
  @tracked showMore = false;

  get sessions() {
    const { sessions } = this.args.course;
    return this.showMore ? sessions : sessions.slice(0, 3);
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
        {{#if (and (not this.showMore) (gt @course.sessions.length 3))}}
          <li>
            <button
              class="show-more link-button"
              type="button"
              {{on "click" (set this "showMore" true)}}
            >
              <FaIcon @icon="angle-down" />
              {{t "general.showMore"}}
            </button>
          </li>
        {{/if}}
      </ul>
    </li>
  </template>
}
