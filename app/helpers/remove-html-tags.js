import { helper } from '@ember/component/helper';
import $ from 'jquery';

export function removeHtmlTags(params) {
  if (!(params[0] === undefined)) {
    return $("<p>" + params[0] + "</p>").text();
  }  
}

export default helper(removeHtmlTags);

