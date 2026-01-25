package com.example.aiaagent.data.repository

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class SettingsRepository(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "ai_agent_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val _settings = MutableStateFlow(AppSettings())
    val settings: Flow<AppSettings> = _settings.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        val openAIApiKey = sharedPreferences.getString(OPENAI_API_KEY, "") ?: ""
        val googleAIApiKey = sharedPreferences.getString(GOOGLE_AI_API_KEY, "") ?: ""
        val selectedProvider = sharedPreferences.getString(SELECTED_PROVIDER, AIProvider.OPENAI.name) ?: AIProvider.OPENAI.name

        _settings.value = AppSettings(
            openAIApiKey = openAIApiKey,
            googleAIApiKey = googleAIApiKey,
            selectedProvider = AIProvider.valueOf(selectedProvider)
        )
    }

    fun updateOpenAIApiKey(apiKey: String) {
        sharedPreferences.edit().putString(OPENAI_API_KEY, apiKey).apply()
        _settings.value = _settings.value.copy(openAIApiKey = apiKey)
    }

    fun updateGoogleAIApiKey(apiKey: String) {
        sharedPreferences.edit().putString(GOOGLE_AI_API_KEY, apiKey).apply()
        _settings.value = _settings.value.copy(googleAIApiKey = apiKey)
    }

    fun updateSelectedProvider(provider: AIProvider) {
        sharedPreferences.edit().putString(SELECTED_PROVIDER, provider.name).apply()
        _settings.value = _settings.value.copy(selectedProvider = provider)
    }

    companion object {
        private const val OPENAI_API_KEY = "openai_api_key"
        private const val GOOGLE_AI_API_KEY = "google_ai_api_key"
        private const val SELECTED_PROVIDER = "selected_provider"
    }
}

data class AppSettings(
    val openAIApiKey: String = "",
    val googleAIApiKey: String = "",
    val selectedProvider: AIProvider = AIProvider.OPENAI
)