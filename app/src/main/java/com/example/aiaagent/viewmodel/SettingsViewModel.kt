package com.example.aiaagent.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.data.repository.AIProvider as RepoAIProvider
import com.example.aiaagent.data.repository.SettingsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val settingsRepository = SettingsRepository(application)
    
    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    
    init {
        viewModelScope.launch {
            settingsRepository.settings.collect { settings ->
                _uiState.value = SettingsUiState(
                    openAIApiKey = settings.openAIApiKey,
                    googleAIApiKey = settings.googleAIApiKey,
                    selectedProvider = convertToAIProvider(settings.selectedProvider)
                )
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
            
            val state = _uiState.value
            settingsRepository.updateOpenAIApiKey(state.openAIApiKey)
            settingsRepository.updateGoogleAIApiKey(state.googleAIApiKey)
            settingsRepository.updateSelectedProvider(convertToRepoAIProvider(state.selectedProvider))
            
            _uiState.value = _uiState.value.copy(isLoading = false, saveSuccess = true)
            
            // Reset save success after a delay
            kotlinx.coroutines.delay(2000)
            _uiState.value = _uiState.value.copy(saveSuccess = false)
        }
    }
    
    private fun convertToAIProvider(provider: RepoAIProvider): AIProvider {
        return when (provider) {
            RepoAIProvider.OPENAI -> AIProvider.OPENAI
            RepoAIProvider.GOOGLE_AI -> AIProvider.GOOGLE_AI
            RepoAIProvider.LOCAL_MODEL -> AIProvider.LOCAL_MODEL
        }
    }
    
    private fun convertToRepoAIProvider(provider: AIProvider): RepoAIProvider {
        return when (provider) {
            AIProvider.OPENAI -> RepoAIProvider.OPENAI
            AIProvider.GOOGLE_AI -> RepoAIProvider.GOOGLE_AI
            AIProvider.LOCAL_MODEL -> RepoAIProvider.LOCAL_MODEL
        }
    }
}

data class SettingsUiState(
    val openAIApiKey: String = "",
    val googleAIApiKey: String = "",
    val selectedProvider: AIProvider = AIProvider.OPENAI,
    val isLoading: Boolean = false,
    val saveSuccess: Boolean = false
)
