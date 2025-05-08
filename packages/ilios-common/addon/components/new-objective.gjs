<section class="new-objective">
  <h4 class="title">{{t "general.newObjective"}}</h4>
  <div class="new-objective-form">
    <label class="form-label">
      {{t "general.description"}}:
    </label>
    <HtmlEditor @content={{this.title}} @update={{this.changeTitle}} @autofocus={{true}} />
    <ValidationError @validatable={{this}} @property="title" />
    <div class="buttons">
      <button
        disabled={{or this.saveObjective.isRunning}}
        class="done text"
        type="button"
        {{on "click" (perform this.saveObjective)}}
      >
        {{#if this.saveObjective.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.done"}}
        {{/if}}
      </button>
      <button class="cancel text" type="button" {{on "click" @cancel}}>
        {{t "general.cancel"}}
      </button>
    </div>
  </div>
</section>