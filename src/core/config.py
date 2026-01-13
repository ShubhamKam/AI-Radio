"""
Configuration management for AI Radio Content Categorizer.
Handles YAML config files and environment variables.
"""

import os
import yaml
from pathlib import Path
from typing import Any, Dict, Optional
from dotenv import load_dotenv


class Config:
    """Configuration manager that loads from YAML and environment variables."""
    
    _instance: Optional['Config'] = None
    _config: Dict[str, Any] = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._load_config()
    
    def _load_config(self) -> None:
        """Load configuration from YAML file and environment variables."""
        # Load environment variables from .env file
        env_paths = [
            Path.home() / '.ai-radio-categorizer' / '.env',
            Path(__file__).parent.parent.parent / 'config' / '.env',
            Path.cwd() / '.env',
        ]
        
        for env_path in env_paths:
            if env_path.exists():
                load_dotenv(env_path)
                break
        
        # Load YAML configuration
        config_paths = [
            Path.home() / '.ai-radio-categorizer' / 'config.yaml',
            Path(__file__).parent.parent.parent / 'config' / 'config.yaml',
            Path.cwd() / 'config' / 'config.yaml',
        ]
        
        for config_path in config_paths:
            if config_path.exists():
                with open(config_path, 'r') as f:
                    self._config = yaml.safe_load(f)
                break
        
        # Override with environment variables
        self._apply_env_overrides()
        
        # Expand paths
        self._expand_paths()
    
    def _apply_env_overrides(self) -> None:
        """Apply environment variable overrides to config."""
        env_mappings = {
            'OPENAI_API_KEY': ('ai', 'openai', 'api_key'),
            'ANTHROPIC_API_KEY': ('ai', 'claude', 'api_key'),
            'GOOGLE_AI_API_KEY': ('ai', 'gemini', 'api_key'),
            'AI_PROVIDER': ('ai', 'default_provider'),
            'LOG_LEVEL': ('app', 'log_level'),
            'DATA_DIR': ('app', 'data_dir'),
            'GOOGLE_CLIENT_ID': ('google_drive', 'client_id'),
            'GOOGLE_CLIENT_SECRET': ('google_drive', 'client_secret'),
        }
        
        for env_var, config_path in env_mappings.items():
            value = os.getenv(env_var)
            if value:
                self._set_nested(config_path, value)
    
    def _set_nested(self, path: tuple, value: Any) -> None:
        """Set a nested configuration value."""
        current = self._config
        for key in path[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[path[-1]] = value
    
    def _expand_paths(self) -> None:
        """Expand ~ in path configurations."""
        path_configs = [
            ('app', 'data_dir'),
            ('database', 'path'),
            ('logging', 'file'),
        ]
        
        for path_tuple in path_configs:
            value = self.get(*path_tuple)
            if value and isinstance(value, str):
                expanded = os.path.expanduser(value)
                self._set_nested(path_tuple, expanded)
    
    def get(self, *keys: str, default: Any = None) -> Any:
        """
        Get a configuration value using dot notation.
        
        Args:
            *keys: Path to the config value (e.g., 'ai', 'openai', 'model')
            default: Default value if not found
            
        Returns:
            The configuration value or default
        """
        current = self._config
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return current
    
    def get_api_key(self, provider: str = None) -> Optional[str]:
        """Get API key for the specified or default AI provider."""
        if provider is None:
            provider = self.get('ai', 'default_provider', default='openai')
        
        key_mapping = {
            'openai': 'OPENAI_API_KEY',
            'claude': 'ANTHROPIC_API_KEY',
            'gemini': 'GOOGLE_AI_API_KEY',
        }
        
        env_key = key_mapping.get(provider)
        if env_key:
            return os.getenv(env_key) or self.get('ai', provider, 'api_key')
        return None
    
    def get_categories(self) -> Dict[str, Any]:
        """Get all category configurations."""
        return self.get('categories', default={})
    
    def get_category(self, category_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific category configuration."""
        return self.get('categories', category_id)
    
    def get_data_dir(self) -> Path:
        """Get the data directory path, creating it if needed."""
        data_dir = Path(self.get('app', 'data_dir', default='~/.ai-radio-categorizer'))
        data_dir = Path(os.path.expanduser(str(data_dir)))
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_dir
    
    def get_google_drive_config(self) -> Dict[str, Any]:
        """Get Google Drive configuration."""
        return self.get('google_drive', default={})
    
    def get_extraction_config(self) -> Dict[str, Any]:
        """Get content extraction configuration."""
        return self.get('extraction', default={})
    
    def get_automation_config(self) -> Dict[str, Any]:
        """Get automation configuration."""
        return self.get('automation', default={})
    
    @property
    def ai_provider(self) -> str:
        """Get the default AI provider."""
        return self.get('ai', 'default_provider', default='openai')
    
    @property
    def log_level(self) -> str:
        """Get the logging level."""
        return self.get('app', 'log_level', default='INFO')
    
    def reload(self) -> None:
        """Reload configuration from files."""
        self._config = {}
        self._load_config()


# Global config instance
config = Config()
