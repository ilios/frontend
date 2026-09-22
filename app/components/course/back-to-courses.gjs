import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';

export default class CourseBackToCoursesComponent extends Component {

  get year() {
    return this.args.course?.year;
  }

  <template>
    <div class="back-to-courses main-section" data-test-back-to-courses>
      <LinkTo @route="courses" @query={{hash year=this.year}}>
        {{t "general.backToCourses"}}
      </LinkTo>
    </div>
  </template>
}
