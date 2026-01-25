package com.example.aiaagent.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "AI Provider Settings",
                style = MaterialTheme.typography.headlineSmall
            )

            // Provider Selection
            Text(
                text = "Default AI Provider",
                style = MaterialTheme.typography.titleMedium
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AIProvider.values().forEach { provider ->
                    FilterChip(
                        selected = uiState.selectedProvider == provider,
                        onClick = { viewModel.updateSelectedProvider(provider) },
                        label = { Text(provider.displayName) }
                    )
                }
            }

            Divider()

            // OpenAI Settings
            Text(
                text = "OpenAI API",
                style = MaterialTheme.typography.titleMedium
            )
            OutlinedTextField(
                value = uiState.openAIApiKey,
                onValueChange = { viewModel.updateOpenAIApiKey(it) },
                label = { Text("OpenAI API Key") },
                placeholder = { Text("sk-...") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Google AI Settings
            Text(
                text = "Google AI API",
                style = MaterialTheme.typography.titleMedium
            )
            OutlinedTextField(
                value = uiState.googleAIApiKey,
                onValueChange = { viewModel.updateGoogleAIApiKey(it) },
                label = { Text("Google AI API Key") },
                placeholder = { Text("AIza...") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Divider()

            // Info Section
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "API Key Setup",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "• OpenAI: Get your API key from https://platform.openai.com/api-keys",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "• Google AI: Get your API key from https://makersuite.google.com/app/apikey",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "API keys are stored securely on your device.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = { viewModel.saveSettings() },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Save Settings")
                }
            }
        }
    }
}

private val AIProvider.displayName: String
    get() = when (this) {
        AIProvider.OPENAI -> "OpenAI GPT"
        AIProvider.GOOGLE_AI -> "Google Gemini"
        AIProvider.LOCAL_MODEL -> "Local Model"
    }