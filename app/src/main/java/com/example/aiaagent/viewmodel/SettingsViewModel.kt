package com.example.aiaagent.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.data.repository.SettingsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val settingsRepository: SettingsRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        settingsRepository?.let {
            viewModelScope.launch {
                it.settings.collect { settings ->
                    _uiState.value = _uiState.value.copy(
                        openAIApiKey = settings.openAIApiKey,
                        googleAIApiKey = settings.googleAIApiKey,
                        selectedProvider = settings.selectedProvider
                    )
                }
            }
        }
    }

    fun updateOpenAIApiKey(apiKey: String) {
        _uiState.value = _uiState.value.copy(openAIApiKey = apiKey)
    }

    fun updateGoogleAIApiKey(apiKey: String) {
        _uiState.value = _uiState.value.copy(googleAIApiKey = apiKey)
    }

    fun updateSelectedProvider(provider: AIProvider) {
        _uiState.value = _uiState.value.copy(selectedProvider = provider)
    }

    fun saveSettings() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                settingsRepository?.updateOpenAIApiKey(_uiState.value.openAIApiKey)
                settingsRepository?.updateGoogleAIApiKey(_uiState.value.googleAIApiKey)
                settingsRepository?.updateSelectedProvider(_uiState.value.selectedProvider)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }
}

data class SettingsUiState(
    val openAIApiKey: String = "",
    val googleAIApiKey: String = "",
    val selectedProvider: AIProvider = AIProvider.OPENAI,
    val isLoading: Boolean = false
)
