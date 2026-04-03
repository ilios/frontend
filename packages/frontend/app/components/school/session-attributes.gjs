import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { or } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import SessionAttributesCollapsed from 'frontend/components/school/session-attributes-collapsed';
import SessionAttributesExpanded from 'frontend/components/school/session-attributes-expanded';

export default class SchoolSessionAttributesComponent extends Component {
  schoolConfigNames = [
    'showSessionAttendanceRequired',
    'showSessionSupplemental',
    'showSessionSpecialAttireRequired',
    'showSessionSpecialEquipmentRequired',
  ];

  @cached
  get schoolConfigsData() {
    return new TrackedAsyncData(this.args.school.configurations);
  }

  @cached
  get schoolConfigs() {
    const rhett = new Map();
    if (this.schoolConfigsData.isResolved) {
      this.schoolConfigsData.value.forEach((config) => {
        rhett.set(config.name, config.parsedValue);
      });
    }
    return rhett;
  }

  get showSessionAttendanceRequired() {
    return this.schoolConfigs.get('showSessionAttendanceRequired') || null;
  }
  get showSessionSupplemental() {
    return this.schoolConfigs.get('showSessionSupplemental') || null;
  }
  get showSessionSpecialAttireRequired() {
    return this.schoolConfigs.get('showSessionSpecialAttireRequired') || null;
  }
  get showSessionSpecialEquipmentRequired() {
    return this.schoolConfigs.get('showSessionSpecialEquipmentRequired') || null;
  }

  save = task({ drop: true }, async (newValues) => {
    try {
      const needToSave = await Promise.all(
        this.schoolConfigNames.map((name) => {
          const value = newValues[name];
          if (value !== null) {
            return this.args.school.setConfigValue(name, value);
          }
        }),
      );

      const toSave = needToSave.filter(Boolean);
      await Promise.all(toSave.map((o) => o.save()));
    } finally {
      this.args.manage(false);
    }
  });
  <template>
    <div class="school-session-attributes" data-test-school-session-attributes ...attributes>
      {{#if (or this.schoolConfigsData.isResolved this.save.isRunning)}}
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
            @saveAll={{perform this.save}}
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
      {{/if}}
    </div>
  </template>
}
