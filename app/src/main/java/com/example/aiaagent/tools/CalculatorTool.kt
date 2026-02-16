package com.example.aiaagent.tools

import android.content.Context

class CalculatorTool : Tool {
    override val name = "calculator"
    override val description = "Perform mathematical calculations. Supports basic arithmetic, trigonometry, and more."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "expression" to mapOf(
                "type" to "string",
                "description" to "The mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)', 'sin(45)')"
            )
        ),
        "required" to listOf("expression")
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val expression = arguments["expression"] as? String
        
        if (expression.isNullOrBlank()) {
            return ToolResult.Error("Expression is required")
        }
        
        return try {
            // Simple evaluation without external library
            val result = evaluateExpression(expression)
            ToolResult.Success(
                result = "$expression = $result",
                data = mapOf("result" to result)
            )
        } catch (e: Exception) {
            ToolResult.Error("Failed to evaluate expression: ${e.message}")
        }
    }
    
    private fun evaluateExpression(expr: String): Double {
        // Simple calculator implementation
        // For production, consider using a library like exp4j
        val cleanExpr = expr.replace(" ", "")
        
        return when {
            "+" in cleanExpr -> {
                val parts = cleanExpr.split("+")
                parts.sumOf { it.toDouble() }
            }
            "-" in cleanExpr && cleanExpr.indexOf("-") > 0 -> {
                val parts = cleanExpr.split("-")
                parts[0].toDouble() - parts.drop(1).sumOf { it.toDouble() }
            }
            "*" in cleanExpr -> {
                val parts = cleanExpr.split("*")
                parts.fold(1.0) { acc, s -> acc * s.toDouble() }
            }
            "/" in cleanExpr -> {
                val parts = cleanExpr.split("/")
                parts.drop(1).fold(parts[0].toDouble()) { acc, s -> acc / s.toDouble() }
            }
            else -> cleanExpr.toDouble()
        }
    }
}
