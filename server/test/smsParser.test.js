import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBankSms } from "../src/lib/smsParser.js";

const cases = [
  ["HUMOCARD *1234: popolnenie 129 037.00 UZS; 06.11.26 14:22; Dostupno: 1 520 000.00 UZS", 129037],
  ["Karta ****1234: Popolnenie scheta 129037.00 UZS 06-11-2026 14:22 Balans: 2000000.00 UZS", 129037],
  ["Пополнение: 129 037,00 UZS. Карта *1234. Баланс: 5 000 000,00 UZS", 129037],
  ["Kartangizga +59 412 so'm tushdi. Qoldiq: 300 000 so'm", 59412],
  ["UZCARD: Perevod na kartu 8600***1234 summa UZS 299,511.00 Balans UZS 1,000,000.00", 299511],
  ["Hisobingizga 249 777,00 сум o'tkazildi", 249777],
  ["*1234 +149 001.00 UZS 06.11 10:01 Ostatok 1 000 000.00 UZS", 149001],
];

for (const [body, amount] of cases) {
  test(`income: ${body.slice(0, 40)}`, () => {
    const r = parseBankSms(body);
    assert.equal(r.isIncome, true);
    assert.equal(r.amount, amount);
  });
}

const outgoing = [
  "HUMOCARD *1234: oplata 45 000.00 UZS; KORZINKA; Dostupno: 1 000 000.00 UZS",
  "Списание 120 000,00 UZS. Карта *1234",
  "Kartadan 50 000 so'm yechildi",
  "Kod podtverzhdeniya: 123456",
];

for (const body of outgoing) {
  test(`not income: ${body.slice(0, 40)}`, () => {
    assert.equal(parseBankSms(body).isIncome, false);
  });
}
