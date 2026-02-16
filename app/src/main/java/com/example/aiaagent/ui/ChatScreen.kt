package com.example.aiaagent.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aiaagent.data.model.Message
import com.example.aiaagent.ui.theme.*
import com.example.aiaagent.viewmodel.ChatViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    onNavigateToSettings: (() -> Unit)? = null
) {
    val uiState by viewModel.uiState.collectAsState()
    var messageText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            coroutineScope.launch {
                listState.animateScrollToItem(uiState.messages.size - 1)
            }
        }
    }

    Scaffold(
        topBar = {
            TermuxTopBar(
                providerName = uiState.currentProvider.name,
                onSettingsClick = onNavigateToSettings,
                onClearClick = { viewModel.clearChat() },
                onTermuxSetupClick = { viewModel.checkTermuxStatus() }
            )
        },
        containerColor = TerminalBlack
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(TerminalBlack)
        ) {
            // Error banner
            AnimatedVisibility(
                visible = uiState.error != null,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                ErrorBanner(
                    error = uiState.error ?: "",
                    onDismiss = { viewModel.clearError() }
                )
            }

            // API Key warning
            AnimatedVisibility(
                visible = !uiState.hasApiKey && uiState.currentProvider.name != "LOCAL_MODEL"
            ) {
                ApiKeyWarning(providerName = uiState.currentProvider.name)
            }

            // Termux status banner
            AnimatedVisibility(
                visible = uiState.termuxStatus != null && uiState.termuxStatus?.isFullySetup == false
            ) {
                TermuxStatusBanner(
                    isTermuxInstalled = uiState.termuxStatus?.isTermuxInstalled ?: false,
                    isApiInstalled = uiState.termuxStatus?.isTermuxApiInstalled ?: false
                )
            }

            // Messages list
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                state = listState,
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (uiState.messages.isEmpty()) {
                    item { TermuxWelcomeMessage() }
                }

                items(uiState.messages) { message ->
                    TermuxMessageBubble(message)
                }

                if (uiState.isLoading) {
                    item { TermuxLoadingIndicator() }
                }
            }

            // Quick action chips
            QuickActionChips(
                onChipClick = { command ->
                    viewModel.sendMessage(command)
                },
                enabled = !uiState.isLoading
            )

            // Input area
            TermuxInputBar(
                messageText = messageText,
                onMessageChange = { messageText = it },
                onSend = {
                    if (messageText.isNotBlank()) {
                        viewModel.sendMessage(messageText)
                        messageText = ""
                    }
                },
                isLoading = uiState.isLoading
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TermuxTopBar(
    providerName: String,
    onSettingsClick: (() -> Unit)?,
    onClearClick: () -> Unit,
    onTermuxSetupClick: () -> Unit
) {
    TopAppBar(
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Terminal icon indicator
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(TerminalGreen)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Termux AI Agent",
                        color = TerminalGreen,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "~ $providerName",
                        color = TerminalGreenDim,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                }
            }
        },
        actions = {
            TextButton(onClick = onTermuxSetupClick) {
                Text(
                    "STATUS",
                    color = TerminalCyan,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp
                )
            }
            if (onSettingsClick != null) {
                TextButton(onClick = onSettingsClick) {
                    Text(
                        "CONFIG",
                        color = TerminalYellow,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                }
            }
            TextButton(onClick = onClearClick) {
                Text(
                    "CLEAR",
                    color = TerminalRed,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = TerminalSurface
        )
    )
}

@Composable
private fun ErrorBanner(error: String, onDismiss: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = TerminalRedDark),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "ERROR: $error",
                color = TerminalRed,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                modifier = Modifier.weight(1f)
            )
            TextButton(onClick = onDismiss) {
                Text("DISMISS", color = TerminalYellow, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun ApiKeyWarning(providerName: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = TerminalSurface),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "WARNING: API Key Required",
                color = TerminalYellow,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp
            )
            Text(
                text = "Configure your $providerName API key in CONFIG.",
                color = TerminalGreenDim,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
private fun TermuxStatusBanner(isTermuxInstalled: Boolean, isApiInstalled: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = TerminalSurface),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "TERMUX STATUS",
                color = TerminalCyan,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${if (isTermuxInstalled) "✓" else "✗"} Termux App: ${if (isTermuxInstalled) "Installed" else "NOT FOUND"}",
                color = if (isTermuxInstalled) TerminalGreen else TerminalRed,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
            Text(
                text = "${if (isApiInstalled) "✓" else "✗"} Termux:API: ${if (isApiInstalled) "Installed" else "NOT FOUND"}",
                color = if (isApiInstalled) TerminalGreen else TerminalRed,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
            if (!isTermuxInstalled) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Install Termux from F-Droid: f-droid.org/packages/com.termux/",
                    color = TerminalYellow,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp
                )
            }
        }
    }
}

@Composable
fun TermuxWelcomeMessage() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = TerminalSurface),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "┌──────────────────────────────────┐",
                color = TerminalGreen,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
            Text(
                text = "│  TERMUX AI AGENT v1.0           │",
                color = TerminalGreen,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "│  Your AI-Powered Terminal        │",
                color = TerminalGreenDim,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
            Text(
                text = "└──────────────────────────────────┘",
                color = TerminalGreen,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Available Termux Features:",
                color = TerminalCyan,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            val features = listOf(
                "Shell Commands" to "Execute any Linux command",
                "Package Manager" to "Install/remove packages (pkg)",
                "File Manager" to "Browse, read, write files",
                "Script Runner" to "Run Python, Bash, Node.js scripts",
                "Network Tools" to "curl, ping, wget, nmap, ssh",
                "System APIs" to "Battery, WiFi, GPS, camera, SMS",
                "Process Manager" to "List/kill processes, monitor usage",
                "Storage Access" to "Shared storage, downloads, DCIM"
            )

            features.forEach { (name, desc) ->
                Row {
                    Text(
                        text = "  > ",
                        color = TerminalGreen,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp
                    )
                    Text(
                        text = name,
                        color = TerminalYellow,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                    Text(
                        text = " - $desc",
                        color = TerminalGreenDim,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Divider(color = TerminalGreenDim.copy(alpha = 0.3f))

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Try: \"List my files\" or \"Install python\" or \"Check battery\"",
                color = TerminalCyan,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
            Text(
                text = "Type a command or ask in natural language...",
                color = TerminalGreenDim,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun TermuxMessageBubble(message: Message) {
    val clipboardManager = LocalClipboardManager.current
    var expanded by remember { mutableStateOf(true) }
    val isTerminalOutput = !message.isFromUser &&
            (message.content.startsWith("🔧") || message.content.startsWith("📋"))
    val isError = message.content.startsWith("Error:")

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isFromUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 340.dp)
                .padding(horizontal = 4.dp)
                .animateContentSize(),
            colors = CardDefaults.cardColors(
                containerColor = when {
                    message.isFromUser -> TerminalUserBubble
                    isTerminalOutput -> TerminalOutputBg
                    isError -> TerminalRedDark
                    else -> TerminalAiBubble
                }
            ),
            shape = RoundedCornerShape(
                topStart = 12.dp,
                topEnd = 12.dp,
                bottomStart = if (message.isFromUser) 12.dp else 2.dp,
                bottomEnd = if (message.isFromUser) 2.dp else 12.dp
            )
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                // Header for terminal output
                if (isTerminalOutput) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expanded = !expanded },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (message.content.startsWith("🔧")) "EXECUTING" else "OUTPUT",
                            color = TerminalCyan,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                        Text(
                            text = if (expanded) "▼" else "▶",
                            color = TerminalGreenDim,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 10.sp
                        )
                    }
                    if (expanded) {
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }

                // User message prefix
                if (message.isFromUser) {
                    Text(
                        text = "$ ",
                        color = TerminalGreen,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }

                // Message content
                AnimatedVisibility(visible = expanded || !isTerminalOutput) {
                    SelectionContainer {
                        Text(
                            text = if (message.isFromUser) message.content else message.content,
                            color = when {
                                message.isFromUser -> Color.White
                                isError -> TerminalRed
                                isTerminalOutput -> TerminalGreen
                                else -> TerminalTextPrimary
                            },
                            fontFamily = FontFamily.Monospace,
                            fontSize = if (isTerminalOutput) 11.sp else 13.sp,
                            lineHeight = if (isTerminalOutput) 15.sp else 18.sp
                        )
                    }
                }

                // Timestamp and copy button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = formatTimestamp(message.timestamp),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 9.sp,
                        color = TerminalGreenDim.copy(alpha = 0.5f)
                    )
                    if (!message.isFromUser) {
                        Text(
                            text = "[COPY]",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 9.sp,
                            color = TerminalCyan.copy(alpha = 0.7f),
                            modifier = Modifier.clickable {
                                clipboardManager.setText(AnnotatedString(message.content))
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TermuxLoadingIndicator() {
    val infiniteTransition = rememberInfiniteTransition(label = "loading")
    val dotCount by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "dots"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.Start
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = TerminalSurface),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(14.dp),
                    strokeWidth = 2.dp,
                    color = TerminalGreen
                )
                Text(
                    text = "processing" + ".".repeat(dotCount.toInt()),
                    color = TerminalGreen,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun QuickActionChips(
    onChipClick: (String) -> Unit,
    enabled: Boolean
) {
    val quickActions = listOf(
        "ls -la" to "List files",
        "Check battery" to "Battery",
        "pkg list-installed" to "Packages",
        "Show WiFi info" to "WiFi",
        "Check storage" to "Storage",
        "Run python --version" to "Python",
        "Show running processes" to "Processes",
        "What's my IP?" to "My IP"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        quickActions.forEach { (command, label) ->
            SuggestionChip(
                onClick = { if (enabled) onChipClick(command) },
                label = {
                    Text(
                        text = label,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = if (enabled) TerminalCyan else TerminalGreenDim
                    )
                },
                enabled = enabled,
                shape = RoundedCornerShape(16.dp),
                colors = SuggestionChipDefaults.suggestionChipColors(
                    containerColor = TerminalSurface,
                    disabledContainerColor = TerminalSurface.copy(alpha = 0.5f)
                ),
                border = SuggestionChipDefaults.suggestionChipBorder(
                    enabled = enabled,
                    borderColor = TerminalGreenDim.copy(alpha = 0.3f),
                    disabledBorderColor = TerminalGreenDim.copy(alpha = 0.1f)
                )
            )
        }
    }
}

@Composable
private fun TermuxInputBar(
    messageText: String,
    onMessageChange: (String) -> Unit,
    onSend: () -> Unit,
    isLoading: Boolean
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = TerminalSurface,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            // Terminal prompt indicator
            Text(
                text = "~$",
                color = TerminalGreen,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier
                    .padding(bottom = 14.dp, start = 4.dp, end = 6.dp)
            )

            OutlinedTextField(
                value = messageText,
                onValueChange = onMessageChange,
                modifier = Modifier.weight(1f),
                placeholder = {
                    Text(
                        "Type command or ask AI...",
                        color = TerminalGreenDim.copy(alpha = 0.5f),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 13.sp
                    )
                },
                maxLines = 4,
                enabled = !isLoading,
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

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = onSend,
                enabled = messageText.isNotBlank() && !isLoading,
                modifier = Modifier.height(52.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TerminalGreen,
                    contentColor = TerminalBlack,
                    disabledContainerColor = TerminalGreenDim.copy(alpha = 0.3f),
                    disabledContentColor = TerminalBlack.copy(alpha = 0.5f)
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    "RUN",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        }
    }
}

private fun formatTimestamp(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp

    return when {
        diff < 60000 -> "now"
        diff < 3600000 -> "${diff / 60000}m"
        diff < 86400000 -> "${diff / 3600000}h"
        else -> "${diff / 86400000}d"
    }
}
