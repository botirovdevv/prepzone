package uz.prepzone.smsagent

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

// Server bilan ishlash (server/src/routes/smsIngest.js). Token tarmoqda
// yuborilmaydi: har so'rov HMAC-SHA256(token, "<ts>.<METHOD> <path>.<body>")
// bilan imzolanadi (server/src/lib/signature.js bilan bir xil).
object Api {
    // Bir SMS'ni qayta yuborganda server dublikat qilmasligi uchun.
    fun ref(sender: String, body: String): String {
        val md = MessageDigest.getInstance("SHA-1").digest("$sender|$body".toByteArray())
        return md.joinToString("") { "%02x".format(it) }.take(32)
    }

    private fun hmac(secret: String, data: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(), "HmacSHA256"))
        return mac.doFinal(data.toByteArray()).joinToString("") { "%02x".format(it) }
    }

    private fun request(c: Context, method: String, path: String, body: String?): Pair<Int, String> {
        val server = Prefs.server(c)
        require(server.startsWith("https://")) { "Faqat https manzil" }
        val conn = URL(server + path).openConnection() as HttpURLConnection
        conn.requestMethod = method
        conn.connectTimeout = 15000
        conn.readTimeout = 20000
        val ts = (System.currentTimeMillis() + Prefs.clockOffset(c)).toString()
        conn.setRequestProperty("X-PZ-Timestamp", ts)
        conn.setRequestProperty("X-PZ-Signature", hmac(Prefs.token(c), "$ts.$method $path.${body ?: ""}"))
        if (body != null) {
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            conn.outputStream.use { it.write(body.toByteArray()) }
        }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
        conn.disconnect()
        return code to text
    }

    // Telefon soati noto'g'ri bo'lsa imzo eskirgan hisoblanadi — server vaqti bilan farqni eslab qolamiz.
    fun syncClock(c: Context) {
        try {
            val conn = URL(Prefs.server(c) + "/api/sms/time").openConnection() as HttpURLConnection
            conn.connectTimeout = 10000
            conn.readTimeout = 10000
            val before = System.currentTimeMillis()
            val text = conn.inputStream.bufferedReader().use { it.readText() }
            val after = System.currentTimeMillis()
            conn.disconnect()
            val serverNow = JSONObject(text).getLong("now")
            Prefs.setClockOffset(c, serverNow - (before + after) / 2)
        } catch (_: Exception) {
        }
    }

    fun ingest(c: Context, sender: String, body: String, receivedAt: Long): Pair<Int, String> {
        val payload = JSONObject()
            .put("sender", sender)
            .put("body", body)
            .put("receivedAt", receivedAt + Prefs.clockOffset(c))
            .put("ref", ref(sender, body))
            .toString()
        val res = request(c, "POST", "/api/sms/ingest", payload)
        if (res.first == 401) {
            syncClock(c)
            return request(c, "POST", "/api/sms/ingest", payload)
        }
        return res
    }

    fun recent(c: Context): Pair<Int, String> {
        val res = request(c, "GET", "/api/sms/recent", null)
        if (res.first == 401) {
            syncClock(c)
            return request(c, "GET", "/api/sms/recent", null)
        }
        return res
    }
}
