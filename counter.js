/* The league's own counter. Each page view, and each episode played, halfway
   heard and finished, is sent to a Google Sheet the site owner keeps
   (counter/Code.gs). Nothing else is collected: no names, no cookies, no IP.
   A random id kept in this browser separates "8 views" from "8 people".
   Visit any page once with ?me on the end to stop counting your own visits
   in that browser (?me=off undoes it). */
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzvfJi9viIG-9ZLPJrqXgq8ycI0JQMxW2gKtMN7DZbvJ03T8ezu_Dc0fucHohLpsNS4Uw/exec'; // the Apps Script web-app URL; empty = count nothing
  var store = {};
  try { store = window.localStorage; } catch (e) {}
  var q = location.search;
  try {
    if (/[?&]me=off\b/.test(q)) store.removeItem('gr_me');
    else if (/[?&]me\b/.test(q)) store.setItem('gr_me', '1');
  } catch (e) {}
  var mine = false;
  try { mine = store.getItem('gr_me') === '1'; } catch (e) {}
  if (!ENDPOINT || mine) return;
  var vid = 'na';
  try {
    vid = store.getItem('gr_vid');
    if (!vid) { vid = Math.random().toString(36).slice(2, 10); store.setItem('gr_vid', vid); }
  } catch (e) { vid = 'na'; }
  var page = location.pathname.replace(/^\/Fantasy-News/i, '') || '/';
  function hit(ev) {
    try {
      fetch(ENDPOINT + '?page=' + encodeURIComponent(page) + '&ev=' + ev + '&v=' + vid,
            { mode: 'no-cors', keepalive: true });
    } catch (e) {}
  }
  var sent = {};
  function once(ev) { if (!sent[ev]) { sent[ev] = 1; hit(ev); } }
  hit('view');
  document.addEventListener('play', function (e) {
    if (e.target.tagName === 'AUDIO') once('play');
  }, true);
  document.addEventListener('timeupdate', function (e) {
    var a = e.target;
    if (a.tagName === 'AUDIO' && a.duration && a.currentTime / a.duration >= 0.5) once('half');
  }, true);
  document.addEventListener('ended', function (e) {
    if (e.target.tagName === 'AUDIO') once('end');
  }, true);
})();
