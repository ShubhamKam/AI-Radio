package com.example.aiaagent.service

import com.example.aiaagent.data.api.*
import com.example.aiaagent.data.model.AIProvider
import com.google.gson.Gson
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class AIProviderService(
    private val provider: AIProvider,
    private val apiKey: String
) {

    private val openAIService: OpenAIService by lazy {
        createRetrofit("https://api.openai.com/").create(OpenAIService::class.java)
    }

    private val googleAIService: GoogleAIService by lazy {
        createRetrofit("https://generativelanguage.googleapis.com/").create(GoogleAIService::class.java)
    }

    private fun createRetrofit(baseUrl: String): Retrofit {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    suspend fun sendMessage(
        message: String,
        conversationHistory: List<OpenAIMessage> = emptyList(),
        tools: List<OpenAITool>? = null
    ): AIProviderResponse {
        return when (provider) {
            AIProvider.OPENAI -> sendToOpenAI(message, conversationHistory, tools)
            AIProvider.GOOGLE_AI -> sendToGoogleAI(message)
            AIProvider.LOCAL_MODEL -> sendToLocalModel(message)
        }
    }

    private suspend fun sendToOpenAI(
        message: String,
        conversationHistory: List<OpenAIMessage>,
        tools: List<OpenAITool>?
    ): AIProviderResponse {
        val messages = conversationHistory + OpenAIMessage(
            role = "user",
            content = message
        )

        val request = OpenAIChatRequest(
            model = "gpt-4",
            messages = messages,
            tools = tools,
            tool_choice = if (tools != null) "auto" else null
        )

        val response = openAIService.chatCompletion(
            authorization = "Bearer $apiKey",
            request = request
        )

        if (!response.isSuccessful) {
            throw Exception("OpenAI API error: ${response.code()} ${response.message()}")
        }

        val body = response.body() ?: throw Exception("Empty response from OpenAI")
        val choice = body.choices.firstOrNull() ?: throw Exception("No choices in response")

        return AIProviderResponse(
            content = choice.message.content,
            toolCalls = choice.message.tool_calls?.map {
                ToolCall(
                    id = it.id,
                    name = it.function.name,
                    arguments = it.function.arguments
                )
            }
        )
    }

    private suspend fun sendToGoogleAI(message: String): AIProviderResponse {
        val request = GoogleAIRequest(
            contents = listOf(
                GoogleAIContent(
                    parts = listOf(GoogleAIPart(text = message))
                )
            )
        )

        val response = googleAIService.generateContent(
            apiKey = apiKey,
            request = request
        )

        if (!response.isSuccessful) {
            throw Exception("Google AI API error: ${response.code()} ${response.message()}")
        }

        val body = response.body() ?: throw Exception("Empty response from Google AI")
        val text = body.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw Exception("No text in response")

        return AIProviderResponse(content = text)
    }

    private suspend fun sendToLocalModel(message: String): AIProviderResponse {
        // Placeholder for local model implementation
        return AIProviderResponse(
            content = "Local model not yet implemented. Message: $message"
        )
    }
}

data class AIProviderResponse(
    val content: String,
    val toolCalls: List<ToolCall>? = null
)

data class ToolCall(
    val id: String,
    val name: String,
    val arguments: String
)
