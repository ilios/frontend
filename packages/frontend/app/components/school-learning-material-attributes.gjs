import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { or } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import SchoolLearningMaterialAttributesCollapsed from 'frontend/components/school-learning-material-attributes-collapsed';
import SchoolLearningMaterialAttributesExpanded from 'frontend/components/school-learning-material-attributes-expanded';

export default class SchoolLearningMaterialAttributesComponent extends Component {
  schoolConfigNames = [
    'learningMaterialAccessibilityRequired',
    'learningMaterialAccessibilityRequirementsLink',
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

  get learningMaterialAccessibilityRequired() {
    return this.schoolConfigs.get('learningMaterialAccessibilityRequired') || false;
  }

  get learningMaterialAccessibilityRequirementsLink() {
    return this.schoolConfigs.get('learningMaterialAccessibilityRequirementsLink') || '';
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
    <div
      class="school-learning-material-attributes"
      data-test-school-learning-material-attributes
      ...attributes
    >
      {{#if (or this.schoolConfigsData.isResolved this.save.isRunning)}}
        {{#if @details}}
          <SchoolLearningMaterialAttributesExpanded
            @canUpdate={{@canUpdate}}
            @accessibilityRequired={{this.learningMaterialAccessibilityRequired}}
            @accessibilityRequirementsLink={{this.learningMaterialAccessibilityRequirementsLink}}
            @collapse={{@collapse}}
            @isManaging={{@isManaging}}
            @manage={{@manage}}
            @saveAll={{perform this.save}}
          />
        {{else}}
          <SchoolLearningMaterialAttributesCollapsed
            @accessibilityRequired={{this.learningMaterialAccessibilityRequired}}
            @accessibilityRequirementsLink={{this.learningMaterialAccessibilityRequirementsLink}}
            @expand={{@expand}}
          />
        {{/if}}
      {{/if}}
    </div>
  </template>
}
