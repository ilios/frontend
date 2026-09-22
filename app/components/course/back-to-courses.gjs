import Component from '@glimmer/component';
import { hash } from '@ember/helper';
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

  get year() {
    return this.args.course?.year;
  }

  <template>
    {{#if this.showLink}}
      <div class="back-to-courses main-section" data-test-back-to-courses>
        <LinkTo @route="courses" @query={{hash year=this.year}}>
          {{t "general.backToCourses"}}
        </LinkTo>
      </div>
    {{/if}}
  </template>
}
