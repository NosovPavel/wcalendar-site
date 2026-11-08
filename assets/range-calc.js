'use strict';

/**
 * Расчёт рабочих/выходных/праздничных дней между датами.
 * Единый источник логики для сайта и тестов: UMD-модуль — в Node это
 * CommonJS (module.exports), в браузере — window.RangeCalc. Ввод — две даты:
 * диапазон ограничен доступными годами, ошибки — inline-подсказки.
 *
 * data — календарь: { days: {'YYYY-MM-DD': code}, years: [...] },
 * коды: 'w' рабочий, 's' сокращённый (рабочий), 'e' выходной,
 * 'h' праздник, 't' перенесённый выходной.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RangeCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  const MS_DAY = 86400000;

  function addDays(dateStr, n) {
    const y = Number(dateStr.slice(0, 4));
    const m = Number(dateStr.slice(5, 7));
    const d = Number(dateStr.slice(8, 10));
    const out = new Date(Date.UTC(y, m - 1, d) + n * MS_DAY);
    return `${out.getUTCFullYear()}-${String(out.getUTCMonth() + 1).padStart(2, '0')}-${String(out.getUTCDate()).padStart(2, '0')}`;
  }

  /** Русская плюрализация: plural(5, 'день', 'дня', 'дней') → 'дней'. */
  function plural(n, one, few, many) {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /**
   * calculateRange(data, start, end) →
   *   { ok: true, working, weekends, holidays, total } |
   *   { ok: false, error: 'invalid' | 'inverted' | 'out-of-range', years }
   * Границы включительно. Классификация (HR-конвенция):
   * 's' — рабочий (ст. 95 ТК), 'h' — праздничный, 'e' и 't' (перенесённый
   * выходной) — выходные дни.
   */
  function calculateRange(data, start, end) {
    if (typeof start !== 'string' || typeof end !== 'string' || !ISO_RE.test(start) || !ISO_RE.test(end)) {
      return { ok: false, error: 'invalid' };
    }
    if (start > end) return { ok: false, error: 'inverted' };
    const days = data.days;
    if (!(start in days) || !(end in days)) {
      return { ok: false, error: 'out-of-range', years: data.years };
    }
    let working = 0;
    let weekends = 0;
    let holidays = 0;
    let cursor = start;
    for (;;) {
      const code = days[cursor];
      if (code === undefined) return { ok: false, error: 'out-of-range', years: data.years };
      if (code === 'w' || code === 's') working++;
      else if (code === 'h') holidays++;
      else weekends++; // 'e' — еженедельный выходной, 't' — перенесённый выходной
      if (cursor === end) break;
      cursor = addDays(cursor, 1);
    }
    return { ok: true, working, weekends, holidays, total: working + weekends + holidays };
  }

  return { calculateRange, plural };
});
