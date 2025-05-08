{{#if @isSelected}}
  <label {{on "click" @remove}} class="selected">
    <input type={{if @allowMultipleParents "checkbox" "radio"}} checked="checked" />
    {{html-safe (remove-html-tags @title)}}
  </label>
{{else}}
  <label {{on "click" @add}}>
    <input type={{if @allowMultipleParents "checkbox" "radio"}} />
    {{html-safe (remove-html-tags @title)}}
  </label>
{{/if}}