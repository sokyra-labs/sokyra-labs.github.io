(function(){
'use strict';

var LANGS = ['en','ru','uk','ar','da','de','es','fi','fr','hi','it','ja','nb','nl','pl','sv','tr','zh'];
var DEFAULT_LANG = 'en';
var STORAGE_KEY = 'sokyra_lang';
var cache = {};
var FLAG_SVG = {
 en:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#00247d"/><path d="M0 0L20 14M20 0L0 14" stroke="#fff" stroke-width="2.4"/><path d="M0 0L20 14M20 0L0 14" stroke="#cf142b" stroke-width="1.2"/><path d="M10 0V14M0 7H20" stroke="#fff" stroke-width="4.6"/><path d="M10 0V14M0 7H20" stroke="#cf142b" stroke-width="2.6"/></svg>',
 ru:'<svg viewBox="0 0 20 14"><rect width="20" height="4.67" fill="#fff"/><rect y="4.67" width="20" height="4.67" fill="#0039a6"/><rect y="9.33" width="20" height="4.67" fill="#d52b1e"/></svg>',
 uk:'<svg viewBox="0 0 20 14"><rect width="20" height="7" fill="#005bbb"/><rect y="7" width="20" height="7" fill="#ffd500"/></svg>',
 ar:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#006c35"/><rect x="3" y="9.4" width="9" height="1.5" fill="#fff"/><path d="M13 10.2a2.7 2.7 0 11-2.6-2.7" stroke="#fff" stroke-width="0.9" fill="none"/></svg>',
 da:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#c60c30"/><rect x="7" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/></svg>',
 de:'<svg viewBox="0 0 20 14"><rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="4.67" fill="#d00"/><rect y="9.33" width="20" height="4.67" fill="#ffce00"/></svg>',
 es:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#aa151b"/><rect y="3.5" width="20" height="7" fill="#f1bf00"/></svg>',
 fi:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect x="6" width="3" height="14" fill="#003580"/><rect y="5.5" width="20" height="3" fill="#003580"/></svg>',
 fr:'<svg viewBox="0 0 20 14"><rect width="6.67" height="14" fill="#0055a4"/><rect x="6.67" width="6.67" height="14" fill="#fff"/><rect x="13.33" width="6.67" height="14" fill="#ef4135"/></svg>',
 hi:'<svg viewBox="0 0 20 14"><rect width="20" height="4.67" fill="#ff9933"/><rect y="4.67" width="20" height="4.67" fill="#fff"/><rect y="9.33" width="20" height="4.67" fill="#138808"/><circle cx="10" cy="7" r="1.3" fill="none" stroke="#000080" stroke-width="0.4"/></svg>',
 it:'<svg viewBox="0 0 20 14"><rect width="6.67" height="14" fill="#009246"/><rect x="6.67" width="6.67" height="14" fill="#fff"/><rect x="13.33" width="6.67" height="14" fill="#ce2b37"/></svg>',
 ja:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="4" fill="#bc002d"/></svg>',
 nb:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#ba0c2f"/><rect x="6" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect x="6.9" width="1.2" height="14" fill="#00205b"/><rect y="6.4" width="20" height="1.2" fill="#00205b"/></svg>',
 nl:'<svg viewBox="0 0 20 14"><rect width="20" height="4.67" fill="#ae1c28"/><rect y="4.67" width="20" height="4.67" fill="#fff"/><rect y="9.33" width="20" height="4.67" fill="#21468b"/></svg>',
 pl:'<svg viewBox="0 0 20 14"><rect width="20" height="7" fill="#fff"/><rect y="7" width="20" height="7" fill="#dc143c"/></svg>',
 sv:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#006aa7"/><rect x="6" width="3" height="14" fill="#fecc00"/><rect y="5.5" width="20" height="3" fill="#fecc00"/></svg>',
 tr:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#e30a17"/><circle cx="8" cy="7" r="3" fill="#fff"/><circle cx="9" cy="7" r="2.4" fill="#e30a17"/><path d="M11.5 5.3l.5 1.6 1.6.1-1.3 1 .5 1.6-1.3-1-1.3 1 .5-1.6-1.3-1 1.6-.1z" fill="#fff"/></svg>',
 zh:'<svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#de2910"/><path d="M4 3l.7 2.1H7l-1.7 1.3.7 2.1L4 7.2 2.3 8.5l.7-2.1L1.3 5.1h2.3z" fill="#ffde00"/></svg>'
};

function detectBrowserLang(){
 var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
 for (var i = 0; i < langs.length; i++) {
  var base = (langs[i] || '').toLowerCase().split('-')[0];
  if (base === 'nn') base = 'nb'; // Norwegian Nynorsk falls back to Bokmål
  if (LANGS.indexOf(base) !== -1) return base;
 }
 return null;
}

function detectLang(){
 var params = new URLSearchParams(location.search);
 var fromUrl = params.get('lang');
 if (fromUrl && LANGS.indexOf(fromUrl) !== -1) return fromUrl;

 var stored = null;
 try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
 if (stored && LANGS.indexOf(stored) !== -1) return stored;

 var detected = detectBrowserLang();
 if (detected) return detected;

 return DEFAULT_LANG;
}

function persistLang(lang){
 try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
 var url = new URL(location.href);
 url.searchParams.set('lang', lang);
 history.replaceState(null, '', url);
}

function loadDict(lang){
 if (cache[lang]) return cache[lang];
 var dict = window.SOKYRA_I18N && window.SOKYRA_I18N[lang];
 if (!dict) { console.error('i18n: no dictionary loaded for "' + lang + '" — check assets/i18n/' + lang + '.js is included before i18n.js'); return null; }
 cache[lang] = dict;
 return dict;
}

function apply(dict, lang){
 document.documentElement.lang = lang;

 var nodes = document.querySelectorAll('[data-i18n]');
 for (var i = 0; i < nodes.length; i++) {
  var key = nodes[i].getAttribute('data-i18n');
  if (Object.prototype.hasOwnProperty.call(dict, key)) nodes[i].textContent = dict[key];
 }

 var attrNodes = document.querySelectorAll('[data-i18n-attr]');
 for (var j = 0; j < attrNodes.length; j++) {
  var spec = attrNodes[j].getAttribute('data-i18n-attr').split(':');
  var attr = spec[0], attrKey = spec[1];
  if (attrKey && Object.prototype.hasOwnProperty.call(dict, attrKey)) attrNodes[j].setAttribute(attr, dict[attrKey]);
 }

 var switches = document.querySelectorAll('.lang-switch');
 for (var s = 0; s < switches.length; s++) {
  var sw = switches[s];
  var buttons = sw.querySelectorAll('[data-lang]');
  for (var k = 0; k < buttons.length; k++) {
   buttons[k].classList.toggle('active', buttons[k].getAttribute('data-lang') === lang);
  }
  var current = sw.querySelector('.lang-current');
  if (current) current.innerHTML = (FLAG_SVG[lang] || '') + '<span>' + lang.toUpperCase() + '</span>';
 }
}

function labelButtons(){
 var buttons = document.querySelectorAll('.lang-switch [data-lang]');
 for (var i = 0; i < buttons.length; i++) {
  var code = buttons[i].getAttribute('data-lang');
  buttons[i].innerHTML = (FLAG_SVG[code] || '') + '<span>' + code.toUpperCase() + '</span>';
 }
}

function setLang(lang, opts){
 opts = opts || {};
 var dict = loadDict(lang);
 if (!dict) return;
 apply(dict, lang);
 if (opts.persist !== false) persistLang(lang);
}

function closePanels(){
 document.querySelectorAll('.lang-switch.open').forEach(function(sw){
  sw.classList.remove('open');
  var trigger = sw.querySelector('.lang-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
 });
}

function init(){
 labelButtons();
 var lang = detectLang();
 setLang(lang, { persist: false });

 document.addEventListener('click', function(e){
  var trigger = e.target.closest && e.target.closest('.lang-trigger');
  if (trigger) {
   var sw = trigger.closest('.lang-switch');
   var wasOpen = sw.classList.contains('open');
   closePanels();
   if (!wasOpen) { sw.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
   return;
  }
  var btn = e.target.closest && e.target.closest('.lang-switch [data-lang]');
  if (btn) { setLang(btn.getAttribute('data-lang')); closePanels(); return; }
  closePanels();
 });
}

if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
} else {
 init();
}
})();
