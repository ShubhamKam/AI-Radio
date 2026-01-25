package com.example.aiaagent.data.repository

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AppToolsRepository(private val context: Context) {

    suspend fun getInstalledApps(): List<AppInfo> = withContext(Dispatchers.IO) {
        val packageManager = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos: List<ResolveInfo> = packageManager.queryIntentActivities(intent, 0)

        resolveInfos.map { resolveInfo ->
            val appName = resolveInfo.loadLabel(packageManager).toString()
            val packageName = resolveInfo.activityInfo.packageName
            val icon = resolveInfo.loadIcon(packageManager)

            AppInfo(appName, packageName, icon)
        }.sortedBy { it.appName }
    }

    suspend fun launchApp(packageName: String): Boolean = withContext(Dispatchers.Main) {
        try {
            val packageManager = context.packageManager
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    suspend fun findAppByName(appName: String): AppInfo? = withContext(Dispatchers.IO) {
        val apps = getInstalledApps()
        // Simple fuzzy matching - could be improved with more sophisticated algorithms
        apps.find { it.appName.contains(appName, ignoreCase = true) } ?:
        apps.find { appName.contains(it.appName, ignoreCase = true) }
    }
}

data class AppInfo(
    val appName: String,
    val packageName: String,
    val icon: Any? = null // Drawable in actual implementation
)