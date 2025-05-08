<section
  class="program-year-manage-objective-competency"
  data-test-program-year-manage-objective-competency
>
  {{#if @domainTrees.length}}
    <ul class="parent-picker" data-test-parent-picker>
      {{#each (sort-by "title" @domainTrees) as |domain|}}
        <li
          class="domain
            {{if
              (or
                (eq @selected.id domain.id)
                (includes @selected.id (map-by 'id' domain.competencies))
              )
              'selected'
            }}"
          data-test-domain
        >
          {{#if (eq @selected.id domain.id)}}
            <label class="domain-title">
              <input
                type="radio"
                checked="checked"
                {{on "click" @remove}}
                data-test-select-domain
              />
              {{domain.title}}
            </label>
          {{else if (includes domain.id (map-by "id" @programYearCompetencies))}}
            <label class="domain-title">
              <input type="radio" {{on "click" (fn @add domain.id)}} data-test-select-domain />
              {{domain.title}}
            </label>
          {{else}}
            <label class="domain-title">
              {{domain.title}}
            </label>
          {{/if}}
          <ul>
            {{#each (sort-by "title" domain.competencies) as |competency|}}
              {{#if (eq competency.id @selected.id)}}
                <li>
                  <label class="selected">
                    <input type="radio" checked="checked" {{on "click" @remove}} />
                    {{competency.title}}
                  </label>
                </li>
              {{else if (includes competency.id (map-by "id" @programYearCompetencies))}}
                <li>
                  <label>
                    <input type="radio" {{on "click" (fn @add competency.id)}} />
                    {{competency.title}}
                  </label>
                </li>
              {{/if}}
            {{/each}}
          </ul>
        </li>
      {{/each}}
    </ul>
  {{else}}
    <p class="no-group" data-test-no-competencies-message>{{t
        "general.missingCompetenciesMessage"
      }}</p>
  {{/if}}
</section>