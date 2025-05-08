<section
  class="school-competencies-collapsed"
  data-test-school-competencies-collapsed
  ...attributes
>
  <div>
    <button
      class="title link-button"
      type="button"
      aria-expanded="false"
      data-test-title
      {{on "click" @expand}}
    >
      {{t "general.competencies"}}
      ({{this.domains.length~}}/
      {{~this.notDomains.length}})
      <FaIcon @icon="caret-right" />
    </button>
  </div>
  <div class="content">
    <table class="condensed">
      <thead>
        <tr>
          <th class="text-left">
            {{t "general.competencyDomain"}}
          </th>
          <th class="text-left">
            {{t "general.summary"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each (sort-by "title" this.domains) as |domain|}}
          <tr data-test-domain>
            <td data-test-domain-title>
              {{domain.title}}
            </td>
            <td class="summary-highlight" data-test-domain-summary>
              {{t "general.subCompetencyCount" count=domain.childCount}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</section>