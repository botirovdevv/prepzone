package uz.prepzone.smsagent

import android.content.Context

// Sozlamalar: server manzili, maxfiy token va kuzatiladigan jo'natuvchilar.
object Prefs {
    private const val NAME = "agent"
    val DEFAULT_SENDERS = listOf(
        "HUMO", "UZCARD", "900", "KAPITALBANK", "HAMKORBANK", "IPAKYULI", "AGROBANK", "NBU", "ANORBANK",
        "TBC", "UZUM", "CLICK", "PAYME", "XALQBANK", "ASAKABANK", "INFINBANK", "OFB", "AAB",
    )

    private fun sp(c: Context) = c.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    fun server(c: Context): String = sp(c).getString("server", "https://prep-zone.uz") ?: ""
    fun token(c: Context): String = sp(c).getString("token", "") ?: ""
    fun senders(c: Context): List<String> =
        (sp(c).getString("senders", null) ?: DEFAULT_SENDERS.joinToString(","))
            .split(",").map { it.trim().uppercase() }.filter { it.isNotEmpty() }

    fun save(c: Context, server: String, token: String, senders: String) {
        sp(c).edit()
            .putString("server", server.trim().trimEnd('/'))
            .putString("token", token.trim())
            .putString("senders", senders)
            .apply()
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
