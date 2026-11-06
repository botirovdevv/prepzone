package uz.prepzone.smsagent

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

// Sozlamalar: server manzili, maxfiy token va kuzatiladigan jo'natuvchilar.
object Prefs {
    private const val NAME = "agent"
    val DEFAULT_SENDERS = listOf(
        "HUMO", "UZCARD", "900", "KAPITALBANK", "HAMKORBANK", "IPAKYULI", "AGROBANK", "NBU", "ANORBANK",
        "TBC", "UZUM", "CLICK", "PAYME", "XALQBANK", "ASAKABANK", "INFINBANK", "OFB", "AAB",
    )

    private fun sp(c: Context) = c.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    // Maxfiy token Android Keystore kaliti bilan shifrlangan holda saqlanadi.
    @Volatile private var secure: SharedPreferences? = null
    private fun secret(c: Context): SharedPreferences = secure ?: synchronized(this) {
        secure ?: EncryptedSharedPreferences.create(
            "agent_secret",
            MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
            c.applicationContext,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        ).also { secure = it }
    }

    fun server(c: Context): String = sp(c).getString("server", "https://prep-zone.uz") ?: ""
    fun token(c: Context): String = secret(c).getString("token", "") ?: ""

    // Server soati bilan farq (ms) — imzo vaqti uchun.
    fun clockOffset(c: Context): Long = sp(c).getLong("offset", 0L)
    fun setClockOffset(c: Context, v: Long) = sp(c).edit().putLong("offset", v).apply()
    fun senders(c: Context): List<String> =
        (sp(c).getString("senders", null) ?: DEFAULT_SENDERS.joinToString(","))
            .split(",").map { it.trim().uppercase() }.filter { it.isNotEmpty() }

    // Faqat https — token va SMS'lar ochiq tarmoqda yurmasin.
    fun save(c: Context, server: String, token: String, senders: String): Boolean {
        val url = server.trim().trimEnd('/')
        if (!url.startsWith("https://")) return false
        sp(c).edit().putString("server", url).putString("senders", senders).apply()
        if (token.isNotBlank()) secret(c).edit().putString("token", token.trim()).apply()
        return true
    }

    // Jo'natuvchi bankmi? Bo'sh ro'yxat = hammasi.
    fun isBankSender(c: Context, sender: String): Boolean {
        val list = senders(c)
        if (list.isEmpty()) return true
        val s = sender.uppercase()
        return list.any { s.contains(it) }
    }

    // Oxirgi yuborishlar jurnali (ekranda ko'rsatish uchun).
    @Synchronized
    fun log(c: Context, line: String) {
        val old = sp(c).getString("log", "") ?: ""
        val lines = (listOf(line) + old.split("\n")).filter { it.isNotBlank() }.take(40)
        sp(c).edit().putString("log", lines.joinToString("\n")).apply()
    }

    fun logText(c: Context): String = sp(c).getString("log", "") ?: ""
}
