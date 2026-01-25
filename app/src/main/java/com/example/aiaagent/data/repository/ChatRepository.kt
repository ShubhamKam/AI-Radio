package com.example.aiaagent.data.repository

import com.example.aiaagent.data.model.Message
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class ChatRepository {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: Flow<List<Message>> = _messages.asStateFlow()

    fun addMessage(message: Message) {
        _messages.value = _messages.value + message
    }

    fun getMessages(): List<Message> = _messages.value
}