// Generic helper for posting files to api
async function postFilesToApi(endpoint, formData, onProgress) {
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if(!res.ok) throw new Error("Server error");
  const blob = await res.blob();
  return blob;
}

// Example single-file helper
async function uploadSingleFile(endpoint, file, extra={}) {
  const fd = new FormData();
  fd.append('file', file);
  Object.keys(extra||{}).forEach(k=>fd.append(k, extra[k]));
  const blob = await postFilesToApi(endpoint, fd);
  return blob;
}
