# Prepzone'ni Oracle Cloud'ga joylash

Bu qo'llanma loyihani **Oracle Cloud "Always Free"** serveriga joylashni qadamma-qadam tushuntiradi. Tekin beriladigan **Ampere A1** server: 4 ta ARM yadro, **24 GB RAM**, 200 GB disk — muddatsiz bepul.

Serverda 3 ta Docker konteyner ishlaydi:

| Konteyner | Vazifasi |
| --- | --- |
| `db` | PostgreSQL 16 — barcha ma'lumotlar (foydalanuvchilar, natijalar, testlar) |
| `api` | Node.js + Express backend (`server/` papkasi) |
| `web` | Caddy — saytni tarqatadi, HTTPS sertifikatni avtomatik oladi, `/api`ni backendga yo'naltiradi |

---

## 1. Oracle Cloud hisobini ochish

1. https://signup.cloud.oracle.com ga kiring va ro'yxatdan o'ting.
   - Karta so'raladi (tekshirish uchun, pul yechilmaydi). Always Free resurslari uchun to'lov yo'q.
   - **Home Region**ni diqqat bilan tanlang — keyin o'zgartirib bo'lmaydi. O'zbekistonga yaqinlari: **Germany Central (Frankfurt)** yoki **UAE East (Dubai)**.
2. Hisob faollashishini kuting (odatda bir necha daqiqa).

## 2. Server (VM) yaratish

1. Menyu → **Compute → Instances → Create instance**.
2. **Name:** `prepzone`.
3. **Image:** *Change image* → **Canonical Ubuntu 24.04** (aarch64).
4. **Shape:** *Change shape* → **Ampere** → `VM.Standard.A1.Flex` → **4 OCPU, 24 GB** memory.
   - "Out of capacity" xatosi chiqsa — boshqa *Availability Domain*ni tanlang yoki keyinroq qayta urinib ko'ring (bepul serverlar ba'zan band bo'ladi). 2 OCPU / 12 GB ham bemalol yetadi.
5. **Networking:** yangi VCN, **public subnet**, *Assign a public IPv4 address* — yoqilgan.
6. **SSH keys:** *Generate a key pair* → ikkala kalitni yuklab oling (private key'ni yo'qotmang!).
7. **Create** → server ishga tushgach, uning **Public IP** manzilini yozib oling.

## 3. 80/443 portlarni ochish

Oracle'da ikki joyda ochish kerak:

**a) Cloud firewall (Security List):**
Instance → *Subnet* havolasi → *Security Lists* → *Default Security List* → **Add Ingress Rules**:

| Source CIDR | Protocol | Destination Port |
| --- | --- | --- |
| `0.0.0.0/0` | TCP | `80` |
| `0.0.0.0/0` | TCP | `443` |
| `0.0.0.0/0` | UDP | `443` |

**b) Serverning o'zidagi firewall** (keyingi qadamda SSH orqali kirgach):

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p udp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 4. Serverga ulanish va Docker o'rnatish

Windows PowerShell'da:

```powershell
ssh -i C:\yol\ssh-key.key ubuntu@<PUBLIC_IP>
```

Serverda:

```bash
sudo apt update && sudo apt -y upgrade
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit   # chiqib, qayta ulaning — docker guruhi kuchga kirishi uchun
```

## 5. Domenni serverga bog'lash

Domen panelida (masalan `prep-zone.uz`) **A record** qo'shing:

| Turi | Nomi | Qiymati |
| --- | --- | --- |
| A | `@` | `<PUBLIC_IP>` |
| A | `www` | `<PUBLIC_IP>` (ixtiyoriy) |

DNS tarqalishi bir necha daqiqadan bir necha soatgacha davom etishi mumkin. Tekshirish: `ping prep-zone.uz`.

## 6. Google orqali kirishni sozlash

1. https://console.cloud.google.com → yangi loyiha (yoki eski Firebase loyihasi).
2. **APIs & Services → OAuth consent screen** → *External* → ilova nomi, email → saqlang → **Publish app**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - *Application type:* **Web application**
   - *Authorized JavaScript origins:* `https://prep-zone.uz` (va lokal sinov uchun `http://localhost:5173`)
4. Berilgan **Client ID**ni yozib oling — u ikki joyga yoziladi (pastga qarang).

## 7. Loyihani serverga yuklash va sozlash

```bash
git clone <repo-manzilingiz> prepzone
cd prepzone

# 1) Docker uchun umumiy sozlamalar
cp .env.example .env
nano .env
```

`.env`:

```ini
VITE_GOOGLE_CLIENT_ID=1234567890-xxxx.apps.googleusercontent.com
VITE_API_URL=
DOMAIN=prep-zone.uz
POSTGRES_PASSWORD=<uzun-tasodifiy-parol>
```

```bash
# 2) Backend sozlamalari
cp server/.env.example server/.env
nano server/.env
```

`server/.env` (DATABASE_URL'ni docker-compose o'zi beradi, yozish shart emas):

```ini
JWT_SECRET=<uzun-tasodifiy-satr>
GOOGLE_CLIENT_ID=1234567890-xxxx.apps.googleusercontent.com
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=Prepzone <verify@mail.prep-zone.uz>
CLIENT_ORIGIN=
```

Tasodifiy parol/satr yaratish: `openssl rand -hex 32`

> **Resend:** https://resend.com da domeningizni tasdiqlang (SPF/DKIM yozuvlari) — aks holda tasdiqlash kodlari spam'ga tushadi.

## 8. Ishga tushirish

```bash
docker compose up -d --build
docker compose logs -f api     # "[prepzone] API ... ishlayapti" chiqishi kerak
```

Birinchi ishga tushishda Caddy HTTPS sertifikatini oladi (1–2 daqiqa). Keyin `https://prep-zone.uz` ochiladi.

Tekshirish: `curl https://prep-zone.uz/api/health` → `{"ok":true}`

## 9. Admin tayinlash

Avval saytda odatdagidek ro'yxatdan o'ting, keyin serverda:

```bash
docker compose exec api node scripts/make-admin.js sizning@email.com
```

Bu sizni **owner** qiladi. Boshqa adminlarni va ularga qaysi bo'limlar ochiqligini saytdagi
Analitika > Foydalanuvchilar bo'limida user qatorini ochib belgilaysiz.

## 10. Amaliyot to'plamlarini yuklash (bir marta)

"Exam questions" bo'limidagi oylik SAT to'plamlari (`content/practice-sets`) bazaga
seed skript bilan yoziladi. Qayta ishga tushirish xavfsiz — dublikat yaratmaydi:

```bash
docker compose exec api node scripts/seed-practice-sets.js --write
```

## 11. Kundalik zaxira nusxa (backup)

`~/prepzone-backup.sh` skripti bazani `~/backups/` ga siqib saqlaydi va 14 kundan
eskilarini o'chiradi (`pipefail` bilan — dump xato bersa bo'sh fayl qolmaydi):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd ~/prepzone
out=~/backups/prepzone-$(date +%F).sql.gz
docker compose exec -T db pg_dump -U prepzone prepzone | gzip > "$out.tmp"
mv "$out.tmp" "$out"
find ~/backups -name "prepzone-*.sql.gz" -mtime +14 -delete
```

Cron (server UTC'da; 22:00 UTC = Toshkent 03:00):

```cron
0 22 * * * /home/ubuntu/prepzone-backup.sh >> /home/ubuntu/backups/backup.log 2>&1
```

Tiklash: `gunzip -c backup.sql.gz | docker compose exec -T db psql -U prepzone prepzone`

> Zaxira nusxalarni vaqti-vaqti bilan serverdan tashqariga ham ko'chirib qo'ying (masalan `scp` bilan kompyuteringizga yoki Oracle Object Storage'ga).

## 12. Yangilash (yangi kodni joylash)

```bash
cd ~/prepzone
git pull
docker compose up -d --build
```

Baza migratsiyalari (`server/src/db/migrations/*.sql`) API ishga tushganda avtomatik bajariladi.

## 13. Shikoyatlar (Ctrl+Shift+F) va JS xatolar logi

Foydalanuvchi istalgan sahifada Ctrl+Shift+F (Mac: Cmd+Shift+F) bossa yoki "Yana" / Sozlamalarda
"Muammo haqida xabar berish"ni tanlasa, xabar screenshot bilan bazaga yoziladi va Telegram botga keladi.
`server/.env` ga quyidagilar kerak (bo'sh bo'lsa faqat bazaga yoziladi):

```
TELEGRAM_BOT_TOKEN=<BotFather tokeni>
TELEGRAM_FEEDBACK_CHAT_ID=<xabar boradigan yagona chat id>
```

Bot sizga yoza olishi uchun avval botga `/start` bosing. Logni o'qish:

```bash
docker exec prepzone-api-1 node scripts/feedback-log.js              # yangi shikoyatlar + JS xatolar
docker exec prepzone-api-1 node scripts/feedback-log.js --since 3d --shots /tmp/pz-shots
docker cp prepzone-api-1:/tmp/pz-shots ./pz-shots                    # screenshot'lar
docker exec prepzone-api-1 node scripts/feedback-log.js --resolve 12 15
docker exec prepzone-api-1 node scripts/feedback-log.js --resolve-error <fingerprint>
```

## Muammolar

| Belgi | Sabab / yechim |
| --- | --- |
| Sayt ochilmaydi | 3-qadamdagi ikkala firewall'ni tekshiring; `docker compose ps` |
| HTTPS sertifikat olinmaydi | DNS hali tarqalmagan yoki 80-port yopiq. `docker compose logs web` |
| Google tugmasi "sozlanmagan" deydi | `.env`dagi `VITE_GOOGLE_CLIENT_ID` bo'sh — to'ldirib `docker compose up -d --build web` |
| Google "invalid origin" xatosi | Google Console'da *Authorized JavaScript origins*ga `https://domeningiz` qo'shilmagan |
| Kodlar emailga kelmaydi | `server/.env`dagi `RESEND_API_KEY`, Resend'da domen tasdiqlanganmi; `docker compose logs api` |
