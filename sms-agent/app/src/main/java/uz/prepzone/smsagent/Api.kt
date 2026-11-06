package uz.prepzone.smsagent

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

// Server bilan ishlash (server/src/routes/smsIngest.js).
object Api {
    // Bir SMS'ni qayta yuborganda server dublikat qilmasligi uchun.
    fun ref(sender: String, body: String): String {
        val md = MessageDigest.getInstance("SHA-1").digest("$sender|$body".toByteArray())
        return md.joinToString("") { "%02x".format(it) }.take(32)
    }

    private fun open(c: Context, path: String, method: String): HttpURLConnection {
        val conn = URL(Prefs.server(c) + path).openConnection() as HttpURLConnection
        conn.requestMethod = method
        conn.connectTimeout = 15000
        conn.readTimeout = 20000
        conn.setRequestProperty("Authorization", "Bearer " + Prefs.token(c))
        conn.setRequestProperty("Content-Type", "application/json")
        return conn
    }

    private fun read(conn: HttpURLConnection): Pair<Int, String> {
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
        conn.disconnect()
        return code to text
    }

    fun ingest(c: Context, sender: String, body: String, receivedAt: Long): Pair<Int, String> {
        val conn = open(c, "/api/sms/ingest", "POST")
        conn.doOutput = true
        val payload = JSONObject()
            .put("sender", sender)
            .put("body", body)
            .put("receivedAt", receivedAt)
            .put("ref", ref(sender, body))
        conn.outputStream.use { it.write(payload.toString().toByteArray()) }
        return read(conn)
    }

    fun recent(c: Context): Pair<Int, String> = read(open(c, "/api/sms/recent", "GET"))
}
