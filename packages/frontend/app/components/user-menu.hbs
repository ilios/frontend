{{#let (unique-id) as |templateId|}}
  <nav
    class="user-menu{{if this.isOpen ' is-open'}}"
    aria-label={{t "general.userMenu"}}
    {{! template-lint-disable no-invalid-interactive }}
    {{on "keyup" this.keyUp}}
    data-test-user-menu
  >
    <button
      type="button"
      class="toggle"
      aria-labelledby="{{templateId}}-user-menu-title"
      aria-haspopup="true"
      aria-expanded={{if this.isOpen "true" "false"}}
      data-test-toggle
      {{on "click" this.toggleMenu}}
    >
      <FaIcon @icon="user" />
      <span id="{{templateId}}-user-menu-title">
        {{get this.model "fullName"}}
      </span>
      <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
    </button>
    {{#if this.isOpen}}
      <div {{on-click-outside (set this "isOpen" false)}}>
        <ul class="menu">
          <li tabindex="-1" data-test-item {{focus}}>
            <LinkToWithAction
              @route="myprofile"
              @action={{set this "isOpen" false}}
              @queryParams={{hash invalidatetokens=null newtoken=null}}
              data-test-item-link
            >
              {{t "general.myProfile"}}
            </LinkToWithAction>
          </li>
          <li tabindex="-1" data-test-item>
            <LinkToWithAction
              @route="logout"
              @action={{set this "isOpen" false}}
              data-test-item-link
            >
              {{t "general.logout"}}
            </LinkToWithAction>
          </li>
        </ul>
      </div>
    {{/if}}
  </nav>
{{/let}}