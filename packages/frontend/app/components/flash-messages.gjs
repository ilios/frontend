<div class="flash-messages" data-test-flash-messages ...attributes>
  {{#each this.flashMessages.arrangedQueue as |f|}}
    <FlashMessage @flash={{f}} as |component flash|>
      {{t flash.message}}
    </FlashMessage>
  {{/each}}
</div>