import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { capitalize } from '@ember/string';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import { fn } from '@ember/helper';
import SchoolSessionAttributesManager from 'frontend/components/school-session-attributes-manager';

export default class SchoolSessionAttributesExpandedComponent extends Component {
  @tracked flippedShowSessionAttendanceRequired = false;
  @tracked flippedShowSessionSpecialAttireRequired = false;
  @tracked flippedShowSessionSpecialEquipmentRequired = false;
  @tracked flippedShowSessionSupplemental = false;

  get showSessionAttendanceRequired() {
    if (this.flippedShowSessionAttendanceRequired) {
      return !this.args.showSessionAttendanceRequired;
    }
    return this.args.showSessionAttendanceRequired;
  }

  get showSessionSpecialAttireRequired() {
    if (this.flippedShowSessionSpecialAttireRequired) {
      return !this.args.showSessionSpecialAttireRequired;
    }
    return this.args.showSessionSpecialAttireRequired;
  }

  get showSessionSpecialEquipmentRequired() {
    if (this.flippedShowSessionSpecialEquipmentRequired) {
      return !this.args.showSessionSpecialEquipmentRequired;
    }
    return this.args.showSessionSpecialEquipmentRequired;
  }

  get showSessionSupplemental() {
    if (this.flippedShowSessionSupplemental) {
      return !this.args.showSessionSupplemental;
    }
    return this.args.showSessionSupplemental;
  }

  resetFlipped() {
    this.flippedShowSessionAttendanceRequired = false;
    this.flippedShowSessionSupplemental = false;
    this.flippedShowSessionSpecialAttireRequired = false;
    this.flippedShowSessionSpecialEquipmentRequired = false;
  }

  @action
  cancel() {
    this.args.manage(false);
    this.resetFlipped();
  }

  @action
  enableSessionAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = !this.args[name];
  }

  @action
  disableSessionAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = this.args[name];
  }

  save = task({ drop: true }, async () => {
    //read the flipped values before we reset them
    const all = {
      showSessionAttendanceRequired: this.showSessionAttendanceRequired,
      showSessionSupplemental: this.showSessionSupplemental,
      showSessionSpecialAttireRequired: this.showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired: this.showSessionSpecialEquipmentRequired,
    };
    this.resetFlipped(); //reset before we save, otherwise there will be a flash of the old values
    await this.args.saveAll(all);
  });
  <template>
    <section
      class="school-session-attributes-expanded"
      data-test-school-session-attributes-expanded
      ...attributes
    >
      <div class="school-session-attributes-expanded-header">
        {{#if @isManaging}}
          <div class="title" data-test-title>
            {{t "general.sessionAttributes"}}
          </div>
        {{else}}
          <button
            class="title link-button"
            type="button"
            aria-expanded="true"
            data-test-title
            {{on "click" @collapse}}
          >
            {{t "general.sessionAttributes"}}
            <FaIcon @icon="caret-down" />
          </button>
        {{/if}}
        <div class="actions">
          {{#if @isManaging}}
            <button
              type="button"
              class="bigadd"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
              data-test-cancel
            >
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          {{else if @canUpdate}}
            <button type="button" {{on "click" (fn @manage true)}} data-test-manage>
              {{t "general.manageSessionAttributes"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div class="school-session-attributes-expanded-content" data-test-expanded>
        {{#if @isManaging}}
          <SchoolSessionAttributesManager
            @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
            @showSessionSupplemental={{this.showSessionSupplemental}}
            @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
            @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
            @enable={{this.enableSessionAttributeConfig}}
            @disable={{this.disableSessionAttributeConfig}}
          />
        {{else}}
          <table data-test-attributes>
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.attribute"}}
                </th>
                <th class="text-left">
                  {{t "general.enabled"}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr data-test-attendance-required>
                <td>
                  {{t "general.attendanceRequired"}}
                </td>
                <td>
                  <FaIcon
                    @icon={{if this.showSessionAttendanceRequired "check" "ban"}}
                    class={{if this.showSessionAttendanceRequired "yes" "no"}}
                  />
                </td>
              </tr>
              <tr data-test-supplemental>
                <td>
                  {{t "general.supplementalCurriculum"}}
                </td>
                <td>
                  <FaIcon
                    @icon={{if this.showSessionSupplemental "check" "ban"}}
                    class={{if this.showSessionSupplemental "yes" "no"}}
                  />
                </td>
              </tr>
              <tr data-test-special-attire-required>
                <td>
                  {{t "general.specialAttireRequired"}}
                </td>
                <td>
                  <FaIcon
                    @icon={{if this.showSessionSpecialAttireRequired "check" "ban"}}
                    class={{if this.showSessionSpecialAttireRequired "yes" "no"}}
                  />
                </td>
              </tr>
              <tr data-test-special-equipment-required>
                <td>
                  {{t "general.specialEquipmentRequired"}}
                </td>
                <td>
                  <FaIcon
                    @icon={{if this.showSessionSpecialEquipmentRequired "check" "ban"}}
                    class={{if this.showSessionSpecialEquipmentRequired "yes" "no"}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        {{/if}}
      </div>
    </section>
  </template>
}
