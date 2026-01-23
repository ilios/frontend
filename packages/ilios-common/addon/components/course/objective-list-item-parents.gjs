import Component from '@glimmer/component';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import FadeText from 'ilios-common/components/fade-text';
import { faArrowRotateLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default class CourseObjectiveListItemParentsComponent extends Component {
  get parentTitles() {
    return this.args.parents
      .slice()
      .sort(sortableByPosition)
      .map((t) => t.title);
  }

  get parentsList() {
    const items = this.parentTitles.map((t) => `<li>${t}</li>`).join('');
    return `<ul>${items}</ul>`;
  }
  <template>
    <div class="course-objective-list-item-parents grid-item" data-test-objective-list-item-parents>
      {{#if @isManaging}}
        <button
          type="button"
          class="bigadd"
          {{on "click" @save}}
          disabled={{@isSaving}}
          aria-label={{t "general.save"}}
          data-test-save
        >
          {{#if @isSaving}}
            <FaIcon @icon={{faSpinner}} @spin={{true}} />
          {{else}}
            <FaIcon @icon={{faCheck}} />
          {{/if}}
        </button>
        <button
          type="button"
          class="bigcancel"
          {{on "click" @cancel}}
          aria-label={{t "general.cancel"}}
          data-test-cancel
        >
          <FaIcon @icon={{faArrowRotateLeft}} />
        </button>
      {{else}}
        {{#if @parents}}
          <FadeText
            @text={{this.parentsList}}
            @forceExpanded={{@fadeTextExpanded}}
            @setExpanded={{@setFadeTextExpanded}}
            as |ft|
          >
            {{#if @editable}}
              <button
                type="button"
                class="link-button"
                title={{t "general.edit"}}
                {{on "click" @manage}}
                data-test-manage
              >
                {{ft.text}}
              </button>
              {{ft.controls}}
            {{else}}
              {{ft.text preserveLinks=true}}
              {{ft.controls}}
            {{/if}}
          </FadeText>
        {{else}}
          {{#if @editable}}
            <button type="button" {{on "click" @manage}} data-test-manage>
              {{t "general.addNew"}}
            </button>
          {{else}}
            {{t "general.none"}}
          {{/if}}
        {{/if}}
      {{/if}}
    </div>
  </template>
}
