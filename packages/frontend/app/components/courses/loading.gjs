import Component from '@glimmer/component';
import { service } from '@ember/service';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import t from 'ember-intl/helpers/t';
import noop from 'ilios-common/helpers/noop';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import LoadingList from 'frontend/components/courses/loading-list';

export default class CoursesLoading extends Component {
  @service store;

  today = new Date();

  get schools() {
    return this.store.peekAll('school');
  }

  get hasMoreThanOneSchool() {
    return this.schools.length > 1;
  }
  <template>
    <section class="courses-root courses-loading main-section" aria-hidden="true">
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
            <select aria-label={{t "general.filterBySchool"}} class="loading-text" disabled>
              {{#each (sortBy "title" this.schools) as |school|}}
                <option>{{school.title}}</option>
              {{/each}}
            </select>
          {{/if}}
        </div>
        <div class="yearsfilter">
          <FaIcon @icon="calendar" @fixedWidth={{true}} />
          <select aria-label={{t "general.filterByYear"}} class="loading-text" disabled></select>
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
            <LoadingList />
          </div>
        </div>
      </section>
    </section>
  </template>
}
