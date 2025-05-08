import Component from '@glimmer/component';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';

export default class CourseBackToCoursesComponent extends Component {
  @service router;

  get showLink() {
    try {
      return Boolean(this.router.urlFor('courses'));
    } catch {
      return false;
    }
  }
  <template>
    {{#if this.showLink}}
      <div class="back-to-courses" data-test-back-to-courses>
        <LinkTo @route="courses">
          {{t "general.backToCourses"}}
        </LinkTo>
      </div>
    {{/if}}
  </template>
}
