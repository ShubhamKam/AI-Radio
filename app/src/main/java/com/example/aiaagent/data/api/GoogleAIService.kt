package com.example.aiaagent.data.api

import com.example.aiaagent.data.model.AIResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface GoogleAIService {
    @POST("v1beta/models/gemini-pro:generateContent")
    suspend fun generateContent(
        @Header("x-goog-api-key") apiKey: String,
        @Body request: GoogleAIRequest
    ): Response<GoogleAIResponse>
}

data class GoogleAIRequest(
    val contents: List<GoogleAIContent>
)

data class GoogleAIContent(
    val parts: List<GoogleAIPart>
)

data class GoogleAIPart(
    val text: String
)

data class GoogleAIResponse(
    val candidates: List<GoogleAICandidate>
)

data class GoogleAICandidate(
    val content: GoogleAIContent
)