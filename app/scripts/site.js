// Preserve bookmarks to the former Angular hash routes. Fragments never reach NGINX.
const legacyPath = window.location.hash.split('?')[0];
if (legacyPath === '#/contact' || legacyPath === '#/contact/') {
  window.location.replace('/contact/' + window.location.search);
} else if (legacyPath === '#/' || legacyPath === '#!/') {
  window.history.replaceState(null, '', '/' + window.location.search);
}
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
