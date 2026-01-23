import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import ResponsiveTd from 'frontend/components/responsive-td';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default class ProgramListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteProgram(this.args.program));
  }

  get canDelete() {
    const hasCiReports = this.args.program.hasMany('curriculumInventoryReports').ids().length > 0;
    const hasProgramYears = this.args.program.hasMany('programYears').ids().length > 0;

    return this.canDeleteData.isResolved
      ? this.canDeleteData.value && !hasCiReports && !hasProgramYears
      : false;
  }

  remove = task({ drop: true }, async () => {
    await this.args.program.destroyRecord();
  });
  <template>
    <tr
      class="list-item {{if this.showRemoveConfirmation 'confirm-removal'}}"
      data-test-active-row
      data-test-program-list-item
    >
      <td class="text-left" colspan="3" data-test-title>
        <LinkTo @route="program" @model={{@program}} data-test-link>
          {{@program.title}}
        </LinkTo>
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-school>
        {{@program.school.title}}
      </td>
      <td class="text-right actions" colspan="2" data-test-program>
        {{#if this.canDelete}}
          <button
            type="button"
            aria-label={{t "general.remove"}}
            {{on "click" (set this "showRemoveConfirmation" true)}}
            data-test-remove
          >
            <FaIcon @icon={{faTrash}} />
          </button>
        {{else}}
          <FaIcon @icon={{faTrash}} class="disabled" />
        {{/if}}
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal" data-test-confirm-removal>
        <ResponsiveTd @smallScreenSpan="5" @largeScreenSpan="7">
          <div class="confirm-message" data-test-message>
            {{t "general.confirmRemoveProgram"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (perform this.remove)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </ResponsiveTd>
      </tr>
    {{/if}}
  </template>
}
