<section class="collapsed-taxonomies" data-test-collapsed-taxonomies>
  <div>
    <button
      class="title link-button"
      type="button"
      aria-expanded="false"
      data-test-title
      {{on "click" @expand}}
    >
      {{t "general.terms"}}
      ({{@subject.terms.length}})
      <FaIcon @icon="caret-right" />
    </button>
  </div>
  {{#if @subject.associatedVocabularies}}
    <div class="content">
      <table class="condensed">
        <thead>
          <tr>
            <th class="text-left">
              {{t "general.vocabulary"}}
            </th>
            <th class="text-center">
              {{t "general.school"}}
            </th>
            <th class="text-center">
              {{t "general.assignedTerms"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each @subject.associatedVocabularies as |vocab|}}
            <tr>
              <td class="text-left">
                {{vocab.title}}
              </td>
              <td class="text-center">
                {{vocab.school.title}}
              </td>
              <td class="text-center">
                {{get
                  (intersect (has-many-ids @subject "terms") (has-many-ids vocab "terms"))
                  "length"
                }}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  {{else}}
    <LoadingSpinner />
  {{/if}}

</section>