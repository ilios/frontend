<table
  class="program-year-objective-list-item-expanded"
  data-test-program-year-objective-list-item-expanded
>
  <thead>
    <th>{{t "general.courses"}}</th>
    <th>{{t "general.objectives"}}</th>
  </thead>
  <tbody>
    {{#if this.courseObjectsLoaded}}
      {{#each (sort-by "title" this.courseObjects) as |obj|}}
        <tr data-test-program-year-objective-list-item-expanded-course>
          <td class="text-top" data-test-title>
            {{obj.title}}
          </td>
          <td class="text-top">
            <ul data-test-course-objectives>
              {{#each (sort-by "title" obj.objectives) as |obj|}}
                <li data-test-course-objective>
                  {{obj.title}}
                </li>
              {{/each}}
            </ul>
          </td>
        </tr>
      {{else}}
        <tr>
          <td colspan="2" data-test-none>{{t "general.none"}}</td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td colspan="2"><LoadingSpinner /></td>
      </tr>
    {{/if}}
  </tbody>
</table>