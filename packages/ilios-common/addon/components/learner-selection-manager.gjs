<div class="learner-selection-manager" data-test-learner-selection-manager>
  <SelectedLearners @learners={{@learners}} @isManaging={{true}} @remove={{@remove}} />
  <div class="available-learners" data-test-available-learners>
    <label>
      {{t "general.availableLearners"}}:
    </label>
    <UserSearch
      @addUser={{@add}}
      @currentlyActiveUsers={{@learners}}
      @placeholder={{t "general.findLearners"}}
    />
  </div>
</div>