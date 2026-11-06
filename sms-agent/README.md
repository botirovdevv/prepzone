# PrepZone SMS-agent (Android)

To'lov kartasi ulangan telefonga o'rnatiladi. Bank SMS'larini (HUMO, Uzcard, banklar) serverga yuboradi. Server summa va chek vaqti bo'yicha to'lovni avtomatik tasdiqlaydi.

## APK olish
- **GitHub Actions:** `sms-agent/` o'zgarsa yoki Actions → "SMS-agent APK" → *Run workflow* bosilsa, APK yig'iladi. Uni *Artifacts* → `prepzone-sms-agent` dan yuklab olasiz.
- **Lokal:** JDK 17 va Android SDK kerak. `cd sms-agent && gradle assembleRelease` buyrug'idan keyin APK `app/build/outputs/apk/release/` papkasida bo'ladi.

## Sozlash
1. Serverda `server/.env` ichida `SMS_INGEST_TOKEN` qiymatini qo'ying (uzun tasodifiy satr).
2. APK'ni telefonga o'rnating ("noma'lum manbalar"ga ruxsat bering) va SMS ruxsatlarini bering.
3. Ilovaga server manzilini (`https://prep-zone.uz`) va tokenni yozib, **Saqlash** ni bosing.
4. **Tekshirish** bosilganda "✅ Server bilan aloqa bor" chiqishi kerak.
5. Telefon sozlamalarida ilova uchun **batareya tejashni o'chiring** (Battery → Unrestricted). Aks holda ba'zi telefonlar (Xiaomi, Samsung) fondagi ishni to'xtatadi.

## Qanday ishlaydi
- SMS kelishi bilan jo'natuvchi ro'yxatda bo'lsa, xabar `POST /api/sms/ingest` ga yuboriladi. Internet bo'lmasa, navbatda kutib turadi.
- Server summani ajratadi (`server/src/lib/smsParser.js`). Kutilayotgan to'lovning unikal summasiga mos kelsa va vaqti chekka yaqin bo'lsa, tarif yoqiladi.
- **Tekshirish** ekrani har bir kutilayotgan chek uchun SMS topilgan yoki topilmaganini ko'rsatadi.
- Agent o'chiq bo'lgan paytda kelgan SMS'lar uchun **Oxirgi 24 soat SMS'larini qayta yuborish** tugmasi bor. Dublikatlar serverda tashlab yuboriladi.

Bankingiz SMS formati tanilmasa, Admin → To'lovlar → SMS log bo'limida "kirim emas" deb chiqadi. Shunday SMS namunasini `server/test/smsParser.test.js` ga qo'shib, parserni moslang.
