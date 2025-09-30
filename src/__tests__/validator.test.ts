import { describe, it, expect } from 'vitest'
import { validateConfig, validateDependencies } from '../utils/validator.js'
import { StatuslineConfig } from '../cli/prompts.js'

describe('validateConfig', () => {
  describe('valid configurations', () => {
    it('should validate a minimal valid configuration', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false,
        installLocation: 'project'
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate a full configuration', () => {
      const config: StatuslineConfig = {
        features: ['directory', 'git', 'model', 'usage', 'session'],
        runtime: 'bash',
        colors: true,
        theme: 'detailed',
        ccusageIntegration: true,
        logging: true,
        customEmojis: true,
        iconStyle: 'nerd-font',
        installLocation: 'global'
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('feature validation', () => {
    it('should fail when no features are selected', () => {
      const config: StatuslineConfig = {
        features: [],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one display feature must be selected')
    })

    it('should warn when many features are selected', () => {
      const config: StatuslineConfig = {
        features: ['directory', 'git', 'model', 'usage', 'session', 'tokens'],
        runtime: 'bash',
        colors: true,
        theme: 'detailed',
        ccusageIntegration: true,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Many features selected. This may impact statusline performance.')
    })
  })

  describe('runtime validation', () => {
    it('should accept bash runtime', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should accept python runtime', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'python',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should accept node runtime', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'node',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should fail with invalid runtime', () => {
      const config: any = {
        features: ['directory'],
        runtime: 'ruby',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid runtime: ruby')
    })
  })

  describe('theme validation', () => {
    it('should accept minimal theme', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should accept detailed theme', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'detailed',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should accept compact theme', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'compact',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
    })

    it('should fail with invalid theme', () => {
      const config: any = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'futuristic',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid theme: futuristic')
    })
  })

  describe('usage integration warnings', () => {
    it('should warn when usage features are enabled without ccusage integration', () => {
      const config: StatuslineConfig = {
        features: ['directory', 'usage'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Usage features selected but ccusage integration is disabled. Some features may not work properly.')
    })

    it('should warn when session feature is enabled without ccusage integration', () => {
      const config: StatuslineConfig = {
        features: ['directory', 'session'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should NOT warn when usage features are enabled WITH ccusage integration', () => {
      const config: StatuslineConfig = {
        features: ['directory', 'usage', 'session'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: true,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      const usageWarning = result.warnings.find(w => w.includes('ccusage integration'))
      expect(usageWarning).toBeUndefined()
    })
  })

  describe('color and emoji validation', () => {
    it('should warn when custom emojis enabled but colors disabled', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: false,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: true
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Custom emojis enabled but colors disabled. Visual distinction may be limited.')
    })

    it('should not warn when both colors and emojis are enabled', () => {
      const config: StatuslineConfig = {
        features: ['directory'],
        runtime: 'bash',
        colors: true,
        theme: 'minimal',
        ccusageIntegration: false,
        logging: false,
        customEmojis: true
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(true)
      const emojiWarning = result.warnings.find(w => w.includes('Custom emojis'))
      expect(emojiWarning).toBeUndefined()
    })
  })

  describe('multiple errors', () => {
    it('should collect multiple errors', () => {
      const config: any = {
        features: [],
        runtime: 'invalid',
        colors: false,
        theme: 'wrong',
        ccusageIntegration: false,
        logging: false,
        customEmojis: false
      }

      const result = validateConfig(config)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
      expect(result.errors).toContain('At least one display feature must be selected')
      expect(result.errors).toContain('Invalid runtime: invalid')
      expect(result.errors).toContain('Invalid theme: wrong')
    })
  })
})

describe('validateDependencies', () => {
  it('should return dependency check results', () => {
    const result = validateDependencies()

    expect(result).toHaveProperty('jq')
    expect(result).toHaveProperty('git')
    expect(result).toHaveProperty('ccusage')
    expect(result).toHaveProperty('python')
    expect(result).toHaveProperty('node')
  })

  it('should return boolean values for all dependencies', () => {
    const result = validateDependencies()

    expect(typeof result.jq).toBe('boolean')
    expect(typeof result.git).toBe('boolean')
    expect(typeof result.ccusage).toBe('boolean')
  })
})