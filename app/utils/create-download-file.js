export default function createDownloadFile(title, content, type) {
  let a = document.createElement('a');
  if (URL && 'download' in a) { //html5 A[download]
    const blob = new Blob([content], {type});
    a.href = URL.createObjectURL(blob);
    a.setAttribute('download', title);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
  }
}
