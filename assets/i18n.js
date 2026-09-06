(function(){
'use strict';

var LANGS = ['en','ru','ua'];
var DEFAULT_LANG = 'en';
var HTML_LANG = { en:'en', ru:'ru', ua:'uk' };
var STORAGE_KEY = 'sokyra_lang';
var cache = {};

function detectBrowserLang(){
 var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
 for (var i = 0; i < langs.length; i++) {
  var base = (langs[i] || '').toLowerCase().split('-')[0];
  if (base === 'uk') return 'ua';
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
 document.documentElement.lang = HTML_LANG[lang] || lang;

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

 var buttons = document.querySelectorAll('.lang-switch [data-lang]');
 for (var k = 0; k < buttons.length; k++) {
  buttons[k].classList.toggle('active', buttons[k].getAttribute('data-lang') === lang);
 }
}

function setLang(lang, opts){
 opts = opts || {};
 var dict = loadDict(lang);
 if (!dict) return;
 apply(dict, lang);
 if (opts.persist !== false) persistLang(lang);
}

function init(){
 var lang = detectLang();
 setLang(lang, { persist: false });

 document.addEventListener('click', function(e){
  var btn = e.target.closest && e.target.closest('.lang-switch [data-lang]');
  if (!btn) return;
  setLang(btn.getAttribute('data-lang'));
 });
}

if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
} else {
 init();
}
})();
