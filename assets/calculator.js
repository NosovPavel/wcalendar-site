'use strict';

/**
 * assets/calculator.js — UI калькулятора: ввод двух дат → результат.
 * Без запросов к серверу; данные — window.CALENDAR_DATA (производственный
 * календарь), логика — window.RangeCalc. Ошибки — inline-подсказки:
 * инвертированный диапазон, годы вне доступных. Результат — aria-live.
 */
(function () {
  if (typeof document === 'undefined') return; // скрипт исполняется только в браузере

  var R = window.RangeCalc;
  var DATA = window.CALENDAR_DATA;
  var fromInput = document.getElementById('calc-from');
  var toInput = document.getElementById('calc-to');
  var resultEl = document.getElementById('calc-result');
  if (!R || !DATA || !fromInput || !toInput || !resultEl) return;

  function yearsText() {
    return DATA.years[0] + '–' + DATA.years[DATA.years.length - 1];
  }

  function renderPlaceholder() {
    resultEl.innerHTML = '<strong>—</strong><span>Заполните обе даты</span>';
  }

  function renderError(res) {
    if (res.error === 'inverted') {
      resultEl.innerHTML = '<strong class="calc-flag">!</strong><span>Даты перепутаны местами: «с» позже «по» — исправьте порядок</span>';
    } else if (res.error === 'out-of-range' || res.error === 'invalid') {
      resultEl.innerHTML = '<strong class="calc-flag">!</strong><span>Доступны годы: ' + yearsText() + '. Выберите даты внутри диапазона.</span>';
    } else {
      resultEl.innerHTML = '<strong class="calc-flag">!</strong><span>Проверьте формат дат</span>';
    }
  }

  function renderOk(res) {
    var sub =
      res.weekends + ' ' + R.plural(res.weekends, 'выходной', 'выходных', 'выходных') +
      ' · ' + res.holidays + ' ' + R.plural(res.holidays, 'праздничный', 'праздничных', 'праздничных') +
      ' · всего ' + res.total;
    resultEl.innerHTML = '<strong>' + res.working + '</strong><span>' + R.plural(res.working, 'рабочий день', 'рабочих дня', 'рабочих дней') + '</span><span class="result-sub">' + sub + '</span>';
  }

  function update() {
    if (!fromInput.value || !toInput.value) return renderPlaceholder();
    var res = R.calculateRange(DATA, fromInput.value, toInput.value);
    if (res.ok) renderOk(res);
    else renderError(res);
  }

  fromInput.addEventListener('change', update);
  toInput.addEventListener('change', update);
  renderPlaceholder();
})();
