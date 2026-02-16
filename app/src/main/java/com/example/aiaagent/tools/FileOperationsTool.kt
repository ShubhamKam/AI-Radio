package com.example.aiaagent.tools

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class FileOperationsTool : Tool {
    override val name = "file_operations"
    override val description = "Perform file system operations: list directories, read files, write files, create/delete files and directories"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "operation" to mapOf(
                "type" to "string",
                "enum" to listOf("list", "read", "write", "create_dir", "delete", "info"),
                "description" to "Operation to perform: list (list directory), read (read file), write (write file), create_dir (create directory), delete (delete file/dir), info (get file info)"
            ),
            "path" to mapOf(
                "type" to "string",
                "description" to "File or directory path. Use absolute paths or relative to Termux home (/data/data/com.termux/files/home)"
            ),
            "content" to mapOf(
                "type" to "string",
                "description" to "Content to write (only for 'write' operation)"
            ),
            "recursive" to mapOf(
                "type" to "boolean",
                "description" to "Whether to perform operation recursively (for list/delete operations)"
            )
        ),
        "required" to listOf("operation", "path")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val operation = arguments["operation"] as? String
        val pathStr = arguments["path"] as? String
        val content = arguments["content"] as? String
        val recursive = arguments["recursive"] as? Boolean ?: false

        if (operation.isNullOrBlank() || pathStr.isNullOrBlank()) {
            return ToolResult.Error("Operation and path are required")
        }

        return try {
            withContext(Dispatchers.IO) {
                val path = resolvePath(pathStr)
                when (operation) {
                    "list" -> listDirectory(path, recursive)
                    "read" -> readFile(path)
                    "write" -> writeFile(path, content ?: "")
                    "create_dir" -> createDirectory(path)
                    "delete" -> deleteFileOrDirectory(path, recursive)
                    "info" -> getFileInfo(path)
                    else -> ToolResult.Error("Unknown operation: $operation")
                }
            }
        } catch (e: Exception) {
            ToolResult.Error("File operation failed: ${e.message}")
        }
    }

    private fun resolvePath(path: String): File {
        // If path starts with /, it's absolute
        if (path.startsWith("/")) {
            return File(path)
        }

        // Check if Termux home exists
        val termuxHome = File("/data/data/com.termux/files/home")
        if (termuxHome.exists()) {
            return File(termuxHome, path)
        }

        // Fall back to app's files directory
        return File("/data/data/com.example.aiaagent/files", path)
    }

    private fun listDirectory(dir: File, recursive: Boolean): ToolResult {
        if (!dir.exists()) {
            return ToolResult.Error("Directory does not exist: ${dir.absolutePath}")
        }

        if (!dir.isDirectory) {
            return ToolResult.Error("Path is not a directory: ${dir.absolutePath}")
        }

        val items = mutableListOf<String>()
        listDirectoryRecursive(dir, "", recursive, items)

        val result = buildString {
            append("Directory listing: ${dir.absolutePath}\n")
            append("Total items: ${items.size}\n\n")
            items.forEach { append(it).append("\n") }
        }

        return ToolResult.Success(
            result = result,
            data = mapOf(
                "path" to dir.absolutePath,
                "items" to items,
                "count" to items.size
            )
        )
    }

    private fun listDirectoryRecursive(dir: File, prefix: String, recursive: Boolean, items: MutableList<String>) {
        val files = dir.listFiles() ?: return

        files.sortedWith(compareBy({ !it.isDirectory }, { it.name })).forEach { file ->
            val type = if (file.isDirectory) "[DIR]" else "[FILE]"
            val size = if (file.isFile) formatFileSize(file.length()) else ""
            items.add("$prefix$type ${file.name} $size".trim())

            if (recursive && file.isDirectory) {
                listDirectoryRecursive(file, "$prefix  ", recursive, items)
            }
        }
    }

    private fun readFile(file: File): ToolResult {
        if (!file.exists()) {
            return ToolResult.Error("File does not exist: ${file.absolutePath}")
        }

        if (!file.isFile) {
            return ToolResult.Error("Path is not a file: ${file.absolutePath}")
        }

        if (file.length() > 1024 * 1024) { // 1MB limit
            return ToolResult.Error("File too large to read (>1MB): ${file.absolutePath}")
        }

        val content = file.readText()

        return ToolResult.Success(
            result = "File: ${file.absolutePath}\nSize: ${formatFileSize(file.length())}\n\nContent:\n$content",
            data = mapOf(
                "path" to file.absolutePath,
                "content" to content,
                "size" to file.length()
            )
        )
    }

    private fun writeFile(file: File, content: String): ToolResult {
        try {
            // Create parent directories if they don't exist
            file.parentFile?.mkdirs()

            file.writeText(content)

            return ToolResult.Success(
                result = "Successfully wrote ${content.length} characters to ${file.absolutePath}",
                data = mapOf(
                    "path" to file.absolutePath,
                    "bytes_written" to content.length
                )
            )
        } catch (e: Exception) {
            return ToolResult.Error("Failed to write file: ${e.message}")
        }
    }

    private fun createDirectory(dir: File): ToolResult {
        if (dir.exists()) {
            return ToolResult.Error("Directory already exists: ${dir.absolutePath}")
        }

        return if (dir.mkdirs()) {
            ToolResult.Success(
                result = "Successfully created directory: ${dir.absolutePath}",
                data = mapOf("path" to dir.absolutePath)
            )
        } else {
            ToolResult.Error("Failed to create directory: ${dir.absolutePath}")
        }
    }

    private fun deleteFileOrDirectory(file: File, recursive: Boolean): ToolResult {
        if (!file.exists()) {
            return ToolResult.Error("Path does not exist: ${file.absolutePath}")
        }

        return try {
            val deleted = if (recursive && file.isDirectory) {
                file.deleteRecursively()
            } else {
                file.delete()
            }

            if (deleted) {
                ToolResult.Success(
                    result = "Successfully deleted: ${file.absolutePath}",
                    data = mapOf("path" to file.absolutePath)
                )
            } else {
                ToolResult.Error("Failed to delete: ${file.absolutePath}")
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to delete: ${e.message}")
        }
    }

    private fun getFileInfo(file: File): ToolResult {
        if (!file.exists()) {
            return ToolResult.Error("Path does not exist: ${file.absolutePath}")
        }

        val info = buildString {
            append("Path: ${file.absolutePath}\n")
            append("Type: ${if (file.isDirectory) "Directory" else "File"}\n")
            append("Size: ${formatFileSize(file.length())}\n")
            append("Can Read: ${file.canRead()}\n")
            append("Can Write: ${file.canWrite()}\n")
            append("Can Execute: ${file.canExecute()}\n")
            append("Last Modified: ${java.util.Date(file.lastModified())}\n")

            if (file.isDirectory) {
                val items = file.listFiles()?.size ?: 0
                append("Items: $items\n")
            }
        }

        return ToolResult.Success(
            result = info,
            data = mapOf(
                "path" to file.absolutePath,
                "type" to if (file.isDirectory) "directory" else "file",
                "size" to file.length(),
                "readable" to file.canRead(),
                "writable" to file.canWrite(),
                "executable" to file.canExecute(),
                "last_modified" to file.lastModified()
            )
        )
    }

    private fun formatFileSize(bytes: Long): String {
        return when {
            bytes < 1024 -> "$bytes B"
            bytes < 1024 * 1024 -> "${bytes / 1024} KB"
            bytes < 1024 * 1024 * 1024 -> "${bytes / (1024 * 1024)} MB"
            else -> "${bytes / (1024 * 1024 * 1024)} GB"
        }
    }
}
