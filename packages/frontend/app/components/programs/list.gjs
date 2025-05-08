<div class="list" ...attributes data-test-program-list>
  {{#if @programs.length}}
    <table>
      <thead>
        <tr>
          <th class="text-left" colspan="3">
            {{t "general.programTitle"}}
          </th>
          <th class="text-center hide-from-small-screen" colspan="2">
            {{t "general.school"}}
          </th>
          <th class="text-right" colspan="2">
            {{t "general.actions"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each @programs as |program|}}
          <Programs::ListItem @program={{program}} />
        {{/each}}
      </tbody>
    </table>
  {{/if}}
</div>