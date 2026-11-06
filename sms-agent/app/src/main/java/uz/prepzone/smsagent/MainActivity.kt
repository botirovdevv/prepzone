package uz.prepzone.smsagent

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import kotlin.concurrent.thread

// Bitta ekran: sozlamalar, "Tekshirish" (kutilayotgan cheklar va ularga
// SMS topilgan-topilmagani) va yuborishlar jurnali.
class MainActivity : AppCompatActivity() {
    private lateinit var server: EditText
    private lateinit var token: EditText
    private lateinit var senders: EditText
    private lateinit var status: TextView
    private lateinit var log: TextView

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        title = "PrepZone SMS-agent"

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(32))
        }
        fun label(text: String) = TextView(this).apply {
            this.text = text
            setTypeface(typeface, Typeface.BOLD)
            setPadding(0, dp(12), 0, dp(4))
        }.also { root.addView(it) }
        fun input(value: String, secret: Boolean = false) = EditText(this).apply {
            setText(value)
            if (secret) inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }.also { root.addView(it, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT)) }
        fun button(text: String, onClick: () -> Unit) = Button(this).apply {
            this.text = text
            setOnClickListener { onClick() }
        }.also { root.addView(it, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT)) }

        label("Server manzili")
        server = input(Prefs.server(this))
        label("Maxfiy token (SMS_INGEST_TOKEN)")
        token = input(Prefs.token(this), secret = true)
        label("Bank jo'natuvchilari (vergul bilan; bo'sh = hammasi)")
        senders = input(Prefs.senders(this).joinToString(","))

        button("Saqlash") {
            Prefs.save(this, server.text.toString(), token.text.toString(), senders.text.toString())
            Toast.makeText(this, "Saqlandi", Toast.LENGTH_SHORT).show()
            check()
        }
        button("🔍 Tekshirish — kutilayotgan cheklar") { check() }
        button("⟳ Oxirgi 24 soatdagi bank SMS'larini qayta yuborish") { resendInbox() }

        label("Holat")
        status = TextView(this).apply { setTextIsSelectable(true) }.also { root.addView(it) }
        label("Yuborishlar jurnali")
        log = TextView(this).apply { setTextIsSelectable(true) }.also { root.addView(it) }

        setContentView(ScrollView(this).apply { addView(root) })
        askPermissions()
    }

    override fun onResume() {
        super.onResume()
        log.text = Prefs.logText(this).ifBlank { "Hali SMS yuborilmagan." }
        if (Prefs.token(this).isNotBlank()) check()
    }

    private fun askPermissions() {
        val need = listOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
            .filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (need.isNotEmpty()) ActivityCompat.requestPermissions(this, need.toTypedArray(), 1)
    }

    private fun fmtTime(iso: String): String = try {
        val inF = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        SimpleDateFormat("dd.MM HH:mm", Locale.US).format(inF.parse(iso.take(19))!!)
    } catch (_: Exception) {
        ""
    }

    // Serverdagi kutilayotgan cheklar: chek yuborilganmi, SMS topildimi.
    private fun check() {
        status.text = "Tekshirilmoqda…"
        thread {
            val text = try {
                val (code, body) = Api.recent(this)
                when {
                    code == 401 -> "🔴 Token noto'g'ri"
                    code !in 200..299 -> "🔴 Server xatosi: $code"
                    else -> render(JSONObject(body))
                }
            } catch (e: Exception) {
                "🔴 Ulanib bo'lmadi: ${e.message}"
            }
            runOnUiThread {
                status.text = text
                log.text = Prefs.logText(this).ifBlank { "Hali SMS yuborilmagan." }
            }
        }
    }

    private fun render(j: JSONObject): String {
        val sb = StringBuilder("✅ Server bilan aloqa bor\n\n")
        val waiting = j.getJSONArray("waiting")
        if (waiting.length() == 0) sb.append("Kutilayotgan to'lov yo'q.\n")
        for (i in 0 until waiting.length()) {
            val p = waiting.getJSONObject(i)
            val state = when {
                p.optString("status") == "pending" && p.optBoolean("smsFound") -> "💰 pul tushdi, chek kutilmoqda"
                p.optString("status") == "pending" -> "⏳ to'lov kutilmoqda"
                p.optBoolean("smsFound") -> "🟢 SMS bor"
                else -> "🔴 chek bor (${fmtTime(p.optString("receiptAt"))}), SMS TOPILMADI"
            }
            sb.append("• ${p.optString("user")} — ${p.optString("plan")} ${p.optInt("months")} oy\n")
            sb.append("   ${p.optInt("amount")} so'm · $state\n")
        }
        val sms = j.getJSONArray("sms")
        sb.append("\nOxirgi SMS'lar:\n")
        for (i in 0 until minOf(sms.length(), 10)) {
            val s = sms.getJSONObject(i)
            val pay = s.optJSONObject("payment")
            val mark = when {
                pay != null -> "🟢 ${pay.optString("user")}"
                s.optBoolean("isIncome") -> "🟡 mos chek yo'q"
                else -> "⚪"
            }
            val amount = if (s.isNull("amount")) "—" else s.optInt("amount").toString()
            sb.append("${fmtTime(s.optString("receivedAt"))}  $amount  $mark\n")
        }
        return sb.toString()
    }

    // Agent o'chiq paytda kelgan SMS'lar uchun: inbox'dan qayta yuborish
    // (server dublikatlarni ref bo'yicha tashlab yuboradi).
    private fun resendInbox() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            askPermissions()
            return
        }
        val since = System.currentTimeMillis() - 24 * 3600_000L
        var n = 0
        contentResolver.query(
            Uri.parse("content://sms/inbox"), arrayOf("address", "body", "date"),
            "date > ?", arrayOf(since.toString()), "date DESC",
        )?.use { c ->
            while (c.moveToNext()) {
                val sender = c.getString(0) ?: continue
                val body = c.getString(1) ?: continue
                if (!Prefs.isBankSender(this, sender)) continue
                ForwardWorker.enqueue(this, sender, body, c.getLong(2))
                n++
            }
        }
        Toast.makeText(this, "$n ta SMS navbatga qo'yildi", Toast.LENGTH_SHORT).show()
    }
}
