<span class="lm-icons" data-test-lm-icons>
  {{#if @learningMaterial.required}}
    <FaIcon class="required" @icon="star" @title={{t "general.required"}} data-test-required-icon />
  {{/if}}
  <LmTypeIcon @type={{@learningMaterial.type}} @mimetype={{@learningMaterial.mimetype}} />
</span>