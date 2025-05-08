<div class="detail-terms-list" data-test-detail-terms-list>
  {{#if this.termsData.isResolved}}
    <div data-test-title>
      {{#if @manage}}
        <button
          class="link-button"
          type="button"
          {{on "click" (fn @manage @vocabulary)}}
          data-test-manage
        >
          <strong>{{@vocabulary.title}}</strong>
        </button>
      {{else}}
        <strong>{{@vocabulary.title}}</strong>
      {{/if}}
      ({{@vocabulary.school.title}})
      {{#if (and @canEdit (not @vocabulary.active))}}
        <span class="inactive">
          ({{t "general.inactive"}})
        </span>
      {{/if}}
    </div>
    <ul class="{{if @canEdit 'removable-list'}} selected-taxonomy-terms">
      {{#each this.terms as |term|}}
        {{#if @canEdit}}
          <DetailTermsListItem @canEdit={{true}} @remove={{@remove}} @term={{term}} />
        {{else}}
          <DetailTermsListItem @canEdit={{false}} @term={{term}} />
        {{/if}}
      {{/each}}
    </ul>
  {{/if}}
</div>