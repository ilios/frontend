<p data-test-not-found>
  {{t "general.notFoundMessage"}}
  <br />
  {{#if this.showLink}}
    <LinkTo @route="dashboard" data-test-back-to-dashboard>
      {{t "general.backToDashboard"}}
    </LinkTo>
  {{/if}}
</p>