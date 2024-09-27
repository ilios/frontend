<div class="locale-chooser" data-test-locale-chooser {{on-click-outside this.close}}>
  <button
    type="button"
    class="toggle"
    aria-haspopup="true"
    aria-expanded={{if this.isOpen "true" "false"}}
    aria-labelledby="{{this.uniqueId}}-locale-chooser-title"
    data-level="toggle"
    data-test-toggle
    {{on "click" (toggle "isOpen" this)}}
    {{on "keyup" this.toggleMenu}}
  >
    <FaIcon @icon="globe" />
    <span id="{{this.uniqueId}}-locale-chooser-title">
      {{t (concat "general.language." this.locale.id)}}
    </span>
    <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
  </button>
  {{#if this.isOpen}}
    <div class="menu" role="menu">
      {{#each this.locales as |loc index|}}
        <button
          type="button"
          role="menuitemradio"
          lang={{loc.id}}
          tabindex="-1"
          aria-checked={{if (eq this.locale.id loc.id) "true" "false"}}
          data-level="item"
          data-test-item
          {{on "click" (fn this.changeLocale loc.id)}}
          {{on "keyup" this.moveFocus}}
          {{on "mouseenter" this.clearFocus}}
          {{focus (eq index 0)}}
        >
          {{loc.text}}
        </button>
      {{/each}}
    </div>
  {{/if}}
</div>