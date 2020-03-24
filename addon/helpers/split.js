import { helper } from '@ember/component/helper';

export default helper(function split([separator, string]) {
  const arr = string.split(separator);
  if (arr.length === 1 && arr[0] === "") {
    return [];
  }
  return arr;
});
