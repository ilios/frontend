import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CoursesLoading extends Component {
  @service store;

  today = new Date();

  get schools() {
    return this.store.peekAll('school');
  }

  get hasMoreThanOneSchool() {
    return this.schools.length > 1;
  }
}

<section class="courses-root courses-loading" aria-hidden="true">
  <div class="filters">
    <div class="toggle-mycourses">
      <ToggleButtons
        @firstOptionSelected={{false}}
        @firstLabel={{t "general.myCourses"}}
        @secondLabel={{t "general.allCourses"}}
        @toggle={{(noop)}}
      />
    </div>
    <div class="schoolsfilter">
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      {{#if this.hasMoreThanOneSchool}}
        <select aria-label={{t "general.filterBySchool"}} disabled>
          {{#each (sort-by "title" this.schools) as |school|}}
            <option>{{school.title}}</option>
          {{/each}}
        </select>
      {{/if}}
    </div>
    <div class="yearsfilter">
      <FaIcon @icon="calendar" @fixedWidth={{true}} />
      <select aria-label={{t "general.filterByYear"}} disabled></select>
    </div>
    <div class="titlefilter">
      <input
        aria-label={{t "general.courseTitleFilterPlaceholder"}}
        placeholder={{t "general.courseTitleFilterPlaceholder"}}
        disabled
      />
    </div>
  </div>
  <section class="courses">
    <div class="header">
      <h2 class="title">
        {{t "general.courses"}}
      </h2>
      <div class="actions"></div>
    </div>
    <section class="new"></section>
    <div class="list">
      <div>
        <Courses::LoadingList />
      </div>
    </div>
  </section>
</section>