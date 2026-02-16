package com.example.aiaagent.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.ui.theme.*
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
                title = {
                    Text(
                        "Configuration",
                        color = TerminalGreen,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    TextButton(onClick = onNavigateBack) {
                        Text(
                            "< BACK",
                            color = TerminalCyan,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = TerminalSurface
                )
            )
        },
        containerColor = TerminalBlack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Provider Selection
            Card(
                colors = CardDefaults.cardColors(containerColor = TerminalSurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "AI PROVIDER",
                        color = TerminalCyan,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AIProvider.values().forEach { provider ->
                            FilterChip(
                                selected = uiState.selectedProvider == provider,
                                onClick = { viewModel.updateSelectedProvider(provider) },
                                label = {
                                    Text(
                                        provider.displayName,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 11.sp
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = TerminalGreenDark,
                                    selectedLabelColor = TerminalGreen,
                                    containerColor = TerminalSurfaceLight,
                                    labelColor = TerminalTextSecondary
                                )
                            )
                        }
                    }
                }
            }

            // OpenAI Settings
            Card(
                colors = CardDefaults.cardColors(containerColor = TerminalSurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "OPENAI API",
                        color = TerminalCyan,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = uiState.openAIApiKey,
                        onValueChange = { viewModel.updateOpenAIApiKey(it) },
                        label = {
                            Text(
                                "API Key",
                                fontFamily = FontFamily.Monospace,
                                color = TerminalGreenDim
                            )
                        },
                        placeholder = {
                            Text(
                                "sk-...",
                                fontFamily = FontFamily.Monospace,
                                color = TerminalTextMuted
                            )
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TerminalGreen,
                            unfocusedTextColor = TerminalGreen,
                            cursorColor = TerminalGreen,
                            focusedBorderColor = TerminalGreen.copy(alpha = 0.5f),
                            unfocusedBorderColor = TerminalGreenDim.copy(alpha = 0.3f),
                            focusedContainerColor = TerminalBlack,
                            unfocusedContainerColor = TerminalBlack
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            }

            // Google AI Settings
            Card(
                colors = CardDefaults.cardColors(containerColor = TerminalSurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "GOOGLE AI API",
                        color = TerminalCyan,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = uiState.googleAIApiKey,
                        onValueChange = { viewModel.updateGoogleAIApiKey(it) },
                        label = {
                            Text(
                                "API Key",
                                fontFamily = FontFamily.Monospace,
                                color = TerminalGreenDim
                            )
                        },
                        placeholder = {
                            Text(
                                "AIza...",
                                fontFamily = FontFamily.Monospace,
                                color = TerminalTextMuted
                            )
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TerminalGreen,
                            unfocusedTextColor = TerminalGreen,
                            cursorColor = TerminalGreen,
                            focusedBorderColor = TerminalGreen.copy(alpha = 0.5f),
                            unfocusedBorderColor = TerminalGreenDim.copy(alpha = 0.3f),
                            focusedContainerColor = TerminalBlack,
                            unfocusedContainerColor = TerminalBlack
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            }

            // Info Section
            Card(
                colors = CardDefaults.cardColors(containerColor = TerminalSurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "API KEY SETUP",
                        color = TerminalYellow,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "> OpenAI: platform.openai.com/api-keys",
                        color = TerminalTextPrimary,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "> Google AI: makersuite.google.com/app/apikey",
                        color = TerminalTextPrimary,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "Keys are encrypted and stored locally on device.",
                        color = TerminalGreenDim,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Save button
            Button(
                onClick = { viewModel.saveSettings() },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = TerminalGreen,
                    contentColor = TerminalBlack,
                    disabledContainerColor = TerminalGreenDim.copy(alpha = 0.3f)
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = TerminalBlack,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        "SAVE CONFIGURATION",
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            // Save success message
            if (uiState.saveSuccess) {
                Text(
                    text = "✓ Configuration saved successfully",
                    color = TerminalGreen,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
        }
    }
}

private val AIProvider.displayName: String
    get() = when (this) {
        AIProvider.OPENAI -> "OpenAI"
        AIProvider.GOOGLE_AI -> "Gemini"
        AIProvider.LOCAL_MODEL -> "Local"
    }
