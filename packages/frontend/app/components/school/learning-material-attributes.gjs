import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import LearningMaterialAttributesCollapsed from './learning-material-attributes-collapsed';
import LearningMaterialAttributesExpanded from './learning-material-attributes-expanded';

export default class SchoolLearningMaterialAttributesComponent extends Component {
  @service schoolConfig;

  get learningMaterialAccessibilityRequired() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequired(this.args.school.id);
  }

  get learningMaterialAccessibilityRequirementsLink() {
    return this.schoolConfig.getLearningMaterialAccessibilityRequirementsLink(this.args.school.id);
  }

  save = task({ drop: true }, async (newValues) => {
    try {
      await this.schoolConfig.setLearningMaterialAccessibilityRequired(
        this.args.school.id,
        newValues.learningMaterialAccessibilityRequired ?? false,
      );
      await this.schoolConfig.setLearningMaterialAccessibilityRequirementsLink(
        this.args.school.id,
        newValues.learningMaterialAccessibilityRequirementsLink ?? '',
      );

      await this.schoolConfig.save();
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
      {{#if @details}}
        <LearningMaterialAttributesExpanded
          @canUpdate={{@canUpdate}}
          @accessibilityRequired={{this.learningMaterialAccessibilityRequired}}
          @accessibilityRequirementsLink={{this.learningMaterialAccessibilityRequirementsLink}}
          @collapse={{@collapse}}
          @isManaging={{@isManaging}}
          @manage={{@manage}}
          @saveAll={{this.save.perform}}
        />
      {{else}}
        <LearningMaterialAttributesCollapsed
          @accessibilityRequired={{this.learningMaterialAccessibilityRequired}}
          @accessibilityRequirementsLink={{this.learningMaterialAccessibilityRequirementsLink}}
          @expand={{@expand}}
        />
      {{/if}}
    </div>
  </template>
}
