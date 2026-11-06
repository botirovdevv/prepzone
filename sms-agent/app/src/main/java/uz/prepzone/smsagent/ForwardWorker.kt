package uz.prepzone.smsagent

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

// SMS'ni serverga yuboradi. Internet bo'lmasa WorkManager navbatda saqlab,
// keyinroq qayta urinadi (telefon qayta yonsa ham).
class ForwardWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val sender = inputData.getString("sender") ?: return Result.failure()
        val body = inputData.getString("body") ?: return Result.failure()
        val at = inputData.getLong("at", System.currentTimeMillis())
        val time = SimpleDateFormat("dd.MM HH:mm", Locale.US).format(Date(at))
        return try {
            val (code, text) = Api.ingest(applicationContext, sender, body, at)
            when {
                code in 200..299 -> {
                    val sms = JSONObject(text).optJSONObject("sms")
                    val amount = sms?.optInt("amount", 0) ?: 0
                    val pay = sms?.optJSONObject("payment")
                    val status = when {
                        pay != null && pay.optString("status") == "approved" ->
                            "🟢 ${pay.optString("user")} — ${pay.optString("plan")} tasdiqlandi"
                        pay != null -> "🟡 ${pay.optString("user")} — pul tushdi, chek kutilmoqda"
                        sms?.optBoolean("isIncome") == true -> "🟡 Kirim $amount so'm — mos chek yo'q"
                        else -> "⚪ Kirim emas"
                    }
                    Prefs.log(applicationContext, "$time  $status")
                    Result.success()
                }
                code == 401 -> {
                    Prefs.log(applicationContext, "$time  🔴 Token noto'g'ri — sozlamalarni tekshiring")
                    Result.failure()
                }
                code in 400..499 -> Result.failure()
                else -> Result.retry()
            }
        } catch (e: Exception) {
            if (runAttemptCount == 0) {
                Prefs.log(applicationContext, "$time  🔴 Yuborilmadi (${e.javaClass.simpleName}), qayta urinadi")
            }
            Result.retry()
        }
    }

    companion object {
        fun enqueue(c: Context, sender: String, body: String, at: Long) {
            val req = OneTimeWorkRequestBuilder<ForwardWorker>()
                .setInputData(workDataOf("sender" to sender, "body" to body, "at" to at))
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(c).enqueue(req)
        }
    }
}
