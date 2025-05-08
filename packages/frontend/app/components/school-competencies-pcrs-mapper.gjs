<section
  class="school-competencies-pcrs-mapper"
  data-test-school-competencies-pcrs-mapper
  ...attributes
>
  <ul>
    {{#each (sort-by "id" @allPcrses) as |pcrs|}}
      <li>
        {{#if (includes pcrs @selectedPcrses)}}
          <label {{on "click" (fn @remove pcrs)}} data-test-pcrs>
            <input type="checkbox" checked="checked" />
            <strong>{{pcrs-uri-to-number pcrs.id}}</strong>
            {{pcrs.description}}
          </label>
        {{else}}
          <label {{on "click" (fn @add pcrs)}} data-test-pcrs>
            <input type="checkbox" />
            <strong>{{pcrs-uri-to-number pcrs.id}}</strong>
            {{pcrs.description}}
          </label>
        {{/if}}
      </li>
    {{/each}}
  </ul>
</section>