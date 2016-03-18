// adopted from http://stackoverflow.com/a/28203456/307333
export default function countDigits(n) {
  var x = parseInt(n, 10);
  if (isNaN(x)) {
    throw new TypeError(n + ' is not a decimal number.');
  }
  return Math.max(Math.floor(Math.log(Math.abs(x)) * Math.LOG10E), 0) + 1;
};
