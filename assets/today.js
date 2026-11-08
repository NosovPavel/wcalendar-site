'use strict';

/**
 * assets/today.js — подсветка «сегодня» в календаре. Динамическое состояние:
 * без JS контент полностью читается. Никаких внешних запросов и ПДн.
 */
(function () {
  if (typeof document === 'undefined') return; // скрипт исполняется только в браузере
  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  document.querySelectorAll('[data-date="' + iso + '"]').forEach(function (el) {
    el.classList.add('day-today');
  });
})();
