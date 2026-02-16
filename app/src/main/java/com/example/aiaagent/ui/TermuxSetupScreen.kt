package com.example.aiaagent.ui

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aiaagent.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermuxSetupScreen(
    onNavigateBack: () -> Unit,
    onOpenTermux: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Termux Setup Guide",
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
            // Header
            Card(
                colors = CardDefaults.cardColors(containerColor = TerminalSurface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "SETUP INSTRUCTIONS",
                        color = TerminalCyan,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Follow these steps to enable full Termux integration:",
                        color = TerminalGreenDim,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp
                    )
                }
            }

            // Step 1
            SetupStepCard(
                stepNumber = 1,
                title = "Install Termux",
                description = "Download and install Termux from F-Droid (recommended) or GitHub Releases. " +
                        "Do NOT use the Play Store version as it is outdated.",
                link = "f-droid.org/packages/com.termux/",
                isRequired = true
            )

            // Step 2
            SetupStepCard(
                stepNumber = 2,
                title = "Install Termux:API",
                description = "Install the Termux:API add-on from F-Droid. This enables access to " +
                        "device features like battery, WiFi, GPS, camera, SMS, and more.",
                link = "f-droid.org/packages/com.termux.api/",
                isRequired = true
            )

            // Step 3
            SetupStepCard(
                stepNumber = 3,
                title = "Setup Termux:API Package",
                description = "Open Termux and run:\n\n  $ pkg install termux-api\n\n" +
                        "This installs the command-line tools that interface with Termux:API.",
                isRequired = true
            )

            // Step 4
            SetupStepCard(
                stepNumber = 4,
                title = "Allow External Apps",
                description = "In Termux, create the properties file to allow external apps:\n\n" +
                        "  $ mkdir -p ~/.termux\n" +
                        "  $ echo 'allow-external-apps=true' > ~/.termux/termux.properties\n\n" +
                        "Then restart Termux or run:\n" +
                        "  $ termux-reload-settings",
                isRequired = true
            )

            // Step 5
            SetupStepCard(
                stepNumber = 5,
                title = "Grant Permissions",
                description = "Grant this app the RUN_COMMAND permission. Go to:\n" +
                        "Android Settings > Apps > AI Agent > Permissions\n\n" +
                        "Also grant Termux:API all necessary permissions (Location, Camera, " +
                        "Contacts, Phone, SMS, Storage, Microphone).",
                isRequired = true
            )

            // Step 6
            SetupStepCard(
                stepNumber = 6,
                title = "Setup Shared Storage (Optional)",
                description = "To access your device's shared storage (Downloads, DCIM, etc.) from Termux:\n\n" +
                        "  $ termux-setup-storage\n\n" +
                        "Grant the storage permission when prompted.",
                isRequired = false
            )

            // Step 7
            SetupStepCard(
                stepNumber = 7,
                title = "Install Common Packages (Optional)",
                description = "Install useful packages:\n\n" +
                        "  $ pkg update && pkg upgrade\n" +
                        "  $ pkg install python nodejs git curl wget\n" +
                        "  $ pkg install nmap openssh vim nano",
                isRequired = false
            )

            // Open Termux button
            Button(
                onClick = onOpenTermux,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TerminalGreen,
                    contentColor = TerminalBlack
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    "OPEN TERMUX",
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SetupStepCard(
    stepNumber: Int,
    title: String,
    description: String,
    link: String? = null,
    isRequired: Boolean = true
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = TerminalSurface),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.animateContentSize()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(if (isRequired) TerminalGreen else TerminalCyan),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$stepNumber",
                        color = TerminalBlack,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = title,
                        color = TerminalGreen,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    if (!isRequired) {
                        Text(
                            text = "OPTIONAL",
                            color = TerminalCyan,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 9.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = description,
                color = TerminalTextPrimary,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                lineHeight = 16.sp
            )

            if (link != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "→ $link",
                    color = TerminalCyan,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp
                )
            }
        }
    }
}
