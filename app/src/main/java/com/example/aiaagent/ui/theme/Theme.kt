package com.example.aiaagent.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val TerminalDarkColorScheme = darkColorScheme(
    primary = TerminalGreen,
    onPrimary = TerminalBlack,
    primaryContainer = TerminalGreenDark,
    onPrimaryContainer = TerminalGreen,
    secondary = TerminalCyan,
    onSecondary = TerminalBlack,
    secondaryContainer = TerminalSurface,
    onSecondaryContainer = TerminalCyan,
    tertiary = TerminalYellow,
    onTertiary = TerminalBlack,
    tertiaryContainer = TerminalSurfaceLight,
    onTertiaryContainer = TerminalYellow,
    error = TerminalRed,
    onError = TerminalBlack,
    errorContainer = TerminalRedDark,
    onErrorContainer = TerminalRed,
    background = TerminalBlack,
    onBackground = TerminalTextPrimary,
    surface = TerminalSurface,
    onSurface = TerminalTextPrimary,
    surfaceVariant = TerminalSurfaceLight,
    onSurfaceVariant = TerminalTextSecondary,
    outline = TerminalGreenDim.copy(alpha = 0.3f),
    outlineVariant = TerminalTextMuted
)

// Light scheme falls back to dark for terminal aesthetic
private val TerminalLightColorScheme = lightColorScheme(
    primary = TerminalGreenDark,
    onPrimary = TerminalBlack,
    primaryContainer = TerminalGreen.copy(alpha = 0.15f),
    onPrimaryContainer = TerminalGreenDark,
    secondary = TerminalCyan,
    onSecondary = TerminalBlack,
    secondaryContainer = TerminalCyan.copy(alpha = 0.1f),
    onSecondaryContainer = TerminalCyan,
    tertiary = TerminalYellow,
    onTertiary = TerminalBlack,
    background = TerminalBlack,
    onBackground = TerminalTextPrimary,
    surface = TerminalSurface,
    onSurface = TerminalTextPrimary,
    surfaceVariant = TerminalSurfaceLight,
    onSurfaceVariant = TerminalTextSecondary,
    outline = TerminalGreenDim.copy(alpha = 0.3f)
)

@Composable
fun AIAAgentTheme(
    darkTheme: Boolean = true, // Always dark for terminal aesthetic
    dynamicColor: Boolean = false, // Disable dynamic color for consistent terminal look
    content: @Composable () -> Unit
) {
    val colorScheme = TerminalDarkColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = TerminalBlack.toArgb()
            window.navigationBarColor = TerminalBlack.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
