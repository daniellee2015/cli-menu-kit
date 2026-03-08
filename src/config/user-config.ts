/**
 * User Configuration System for CLI Menu Kit
 * Provides persistent user preferences
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface UserConfig {
  language?: string;
  theme?: string;
  [key: string]: any;  // Allow custom config fields
}

export interface ConfigOptions {
  appName: string;           // Application name for config directory
  configFileName?: string;   // Config file name (default: 'config.json')
  defaults?: UserConfig;     // Default configuration
}

class ConfigManager {
  private appName: string;
  private configFileName: string;
  private defaults: UserConfig;
  private configDir: string;
  private configPath: string;

  constructor(options: ConfigOptions) {
    this.appName = options.appName;
    this.configFileName = options.configFileName || 'config.json';
    this.defaults = options.defaults || {};

    // Set config directory
    this.configDir = path.join(os.homedir(), `.${this.appName}`);
    this.configPath = path.join(this.configDir, this.configFileName);

    // Ensure config directory exists
    this.ensureConfigDir();
  }

  /**
   * Ensure config directory exists
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Load configuration
   */
  load(): UserConfig {
    if (!fs.existsSync(this.configPath)) {
      return { ...this.defaults };
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(content);
      return { ...this.defaults, ...config };
    } catch (error) {
      console.error('Failed to load config:', error);
      return { ...this.defaults };
    }
  }

  /**
   * Save configuration
   */
  save(config: Partial<UserConfig>): void {
    const currentConfig = this.load();
    const newConfig = {
      ...currentConfig,
      ...config,
      updated_at: new Date().toISOString()
    };

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * Get a specific config value
   */
  get<K extends keyof UserConfig>(key: K): UserConfig[K] {
    const config = this.load();
    return config[key];
  }

  /**
   * Set a specific config value
   */
  set<K extends keyof UserConfig>(key: K, value: UserConfig[K]): void {
    this.save({ [key]: value });
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Get config directory path
   */
  getConfigDir(): string {
    return this.configDir;
  }
}

// Global config manager instance
let globalConfigManager: ConfigManager | null = null;

/**
 * Initialize config manager
 */
export function initConfig(options: ConfigOptions): ConfigManager {
  globalConfigManager = new ConfigManager(options);
  return globalConfigManager;
}

/**
 * Get global config manager
 */
export function getConfigManager(): ConfigManager {
  if (!globalConfigManager) {
    throw new Error('Config manager not initialized. Call initConfig() first.');
  }
  return globalConfigManager;
}

/**
 * Load configuration
 */
export function loadConfig(): UserConfig {
  return getConfigManager().load();
}

/**
 * Save configuration
 */
export function saveConfig(config: Partial<UserConfig>): void {
  getConfigManager().save(config);
}

/**
 * Get config value
 */
export function getConfig<K extends keyof UserConfig>(key: K): UserConfig[K] {
  return getConfigManager().get(key);
}

/**
 * Set config value
 */
export function setConfig<K extends keyof UserConfig>(key: K, value: UserConfig[K]): void {
  getConfigManager().set(key, value);
}

/**
 * Reset configuration
 */
export function resetConfig(): void {
  getConfigManager().reset();
}
