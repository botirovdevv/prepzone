package uz.prepzone.smsagent

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

// Yangi SMS keldi: bank jo'natuvchisidan bo'lsa — serverga yuboriladi.
class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val parts = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        // Uzun SMS bir nechta bo'lak bo'lib keladi — jo'natuvchi bo'yicha birlashtiramiz.
        parts.groupBy { it.displayOriginatingAddress ?: "" }.forEach { (sender, msgs) ->
            if (!Prefs.isBankSender(context, sender)) return@forEach
            val body = msgs.joinToString("") { it.displayMessageBody ?: "" }
            // Telefonga kelgan vaqt — chek vaqti bilan solishtirish uchun.
            ForwardWorker.enqueue(context, sender, body, System.currentTimeMillis())
        }
    }
}
