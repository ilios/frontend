
/**
 * Stolen from https://github.com/auth0/jwt-decode/blob/master/lib/base64_url_decode.js
 */
let b64DecodeUnicode = function (str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    let code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
};

export default function jwtDecode(token) {
  let parts = token.split('.');
  let body = parts[1];
  return JSON.parse(b64DecodeUnicode(body));
}
