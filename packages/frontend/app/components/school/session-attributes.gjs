import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import SessionAttributesCollapsed from './session-attributes-collapsed';
import SessionAttributesExpanded from './session-attributes-expanded';

export default class SchoolSessionAttributesComponent extends Component {
  @service schoolConfig;

  get showSessionAttendanceRequired() {
    return this.schoolConfig.getShowSessionAttendanceRequired(this.args.school.id);
  }
  get showSessionSupplemental() {
    return this.schoolConfig.getShowSessionSupplemental(this.args.school.id);
  }
  get showSessionSpecialAttireRequired() {
    return this.schoolConfig.getShowSessionSpecialAttireRequired(this.args.school.id);
  }
  get showSessionSpecialEquipmentRequired() {
    return this.schoolConfig.getShowSessionSpecialEquipmentRequired(this.args.school.id);
  }

  save = task({ drop: true }, async (newValues) => {
    try {
      await this.schoolConfig.setShowSessionAttendanceRequired(
        this.args.school.id,
        newValues.showSessionAttendanceRequired ?? false,
      );
      await this.schoolConfig.setShowSessionSupplemental(
        this.args.school.id,
        newValues.showSessionSupplemental ?? false,
      );
      await this.schoolConfig.setShowSessionSpecialAttireRequired(
        this.args.school.id,
        newValues.showSessionSpecialAttireRequired ?? false,
      );
      await this.schoolConfig.setShowSessionSpecialEquipmentRequired(
        this.args.school.id,
        newValues.showSessionSpecialEquipmentRequired ?? false,
      );

      await this.schoolConfig.save();
    } finally {
      this.args.manage(false);
    }
  });
  <template>
    <div class="school-session-attributes" data-test-school-session-attributes ...attributes>
      {{#if @details}}
        <SessionAttributesExpanded
          @canUpdate={{@canUpdate}}
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @collapse={{@collapse}}
          @isManaging={{@isManaging}}
          @manage={{@manage}}
          @saveAll={{this.save.perform}}
        />
      {{else}}
        <SessionAttributesCollapsed
          @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
          @showSessionSupplemental={{this.showSessionSupplemental}}
          @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
          @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
          @expand={{@expand}}
        />
      {{/if}}
    </div>
  </template>
}
