package com.example.aiaagent.data.model

enum class ToolActionType {
    OPEN_APP,
    QUERY_DEVICE,
    LOCAL_INFERENCE
}

data class ToolAction(
    val type: ToolActionType,
    val title: String,
    val description: String,
    val payload: Map<String, String> = emptyMap()
)
