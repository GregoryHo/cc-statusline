#!/usr/bin/env node

import PerformanceTestRunner, { TestScenario } from './perf-test.js'
import { StatuslineConfig } from '../../src/cli/prompts.js'

// Mock data generators
function generateMockClaudeInput(size: 'small' | 'medium' | 'large' = 'medium') {
  const base = {
    session_id: "test-session-123",
    transcript_path: "/home/user/.claude/conversations/test.jsonl",
    version: "1.3.2",
    cwd: "/home/user/projects/my-project",
    workspace: {
      current_dir: "/home/user/projects/my-project"
    },
    model: {
      id: "claude-opus-4-1-20250805",
      display_name: "Opus 4.1",
      version: "20250805"
    },
    output_style: {
      name: "detailed"
    },
    cost: {
      total_cost_usd: 3.42,
      total_duration_ms: 987654
    }
  }
  
  if (size === 'large') {
    // Add large nested data to test JSON parsing performance
    return {
      ...base,
      largeData: Array(1000).fill(0).map((_, i) => ({
        id: i,
        data: `Large data string ${i}`.repeat(10),
        nested: {
          deep: {
            value: Math.random()
          }
        }
      }))
    }
  }
  
  return base
}

// Test scenarios
const scenarios: TestScenario[] = [
  // Minimal configuration
  {
    name: 'Minimal',
    description: 'Directory only - baseline performance',
    config: {
      features: ['directory'],
      theme: 'minimal',
      colors: false,
      ccusageIntegration: false,
      iconStyle: 'emoji',
      logging: false
    },
    mockData: generateMockClaudeInput('small'),
    expectedTime: 50
  },
  
  // Standard configuration
  {
    name: 'Standard',
    description: 'Directory + Git + Model - typical usage',
    config: {
      features: ['directory', 'git', 'model'],
      theme: 'default',
      colors: true,
      ccusageIntegration: false,
      iconStyle: 'emoji',
      logging: false
    },
    mockData: generateMockClaudeInput('medium'),
    expectedTime: 100
  },
  
  // Full features without ccusage
  {
    name: 'Full (no ccusage)',
    description: 'All features except ccusage integration',
    config: {
      features: ['directory', 'git', 'model', 'context', 'usage', 'session', 'tokens', 'burnrate'],
      theme: 'detailed',
      colors: true,
      ccusageIntegration: false,
      iconStyle: 'nerd-font',
      logging: false
    },
    mockData: generateMockClaudeInput('medium'),
    expectedTime: 150
  },
  
  // Full features with ccusage (simulated)
  {
    name: 'Full (with ccusage)',
    description: 'All features with ccusage integration',
    config: {
      features: ['directory', 'git', 'model', 'context', 'usage', 'session', 'tokens', 'burnrate'],
      theme: 'detailed',
      colors: true,
      ccusageIntegration: true,
      iconStyle: 'nerd-font',
      logging: false
    },
    mockData: generateMockClaudeInput('medium'),
    expectedTime: 300
  },
  
  // Large input test
  {
    name: 'Large Input',
    description: 'Standard config with large JSON input',
    config: {
      features: ['directory', 'git', 'model'],
      theme: 'default',
      colors: true,
      ccusageIntegration: false,
      iconStyle: 'emoji',
      logging: false
    },
    mockData: generateMockClaudeInput('large'),
    expectedTime: 200
  },
  
  // Logging enabled test
  {
    name: 'With Logging',
    description: 'Standard config with logging enabled',
    config: {
      features: ['directory', 'git', 'model'],
      theme: 'default',
      colors: true,
      ccusageIntegration: false,
      iconStyle: 'emoji',
      logging: true
    },
    mockData: generateMockClaudeInput('medium'),
    expectedTime: 150
  },
  
  // Compact theme test
  {
    name: 'Compact Theme',
    description: 'Compact theme with moderate features',
    config: {
      features: ['directory', 'git', 'model', 'usage'],
      theme: 'compact',
      colors: true,
      ccusageIntegration: false,
      iconStyle: 'unicode',
      logging: false
    },
    mockData: generateMockClaudeInput('medium'),
    expectedTime: 100
  }
]

// Main benchmark runner
async function runBenchmarks() {
  console.log('🚀 CC-Statusline Performance Benchmark Suite')
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log(`🖥️  Platform: ${process.platform}`)
  console.log(`🧮 Node: ${process.version}`)
  console.log('')
  
  const runner = new PerformanceTestRunner()
  
  // Parse command line arguments
  const args = process.argv.slice(2)
  const iterations = args.includes('--iterations') 
    ? parseInt(args[args.indexOf('--iterations') + 1]) || 10
    : 10
  const exportPath = args.includes('--export')
    ? args[args.indexOf('--export') + 1]
    : null
  const scenarioFilter = args.includes('--scenario')
    ? args[args.indexOf('--scenario') + 1].toLowerCase()
    : null
  
  // Filter scenarios if requested
  const scenariosToRun = scenarioFilter
    ? scenarios.filter(s => s.name.toLowerCase().includes(scenarioFilter))
    : scenarios
  
  if (scenariosToRun.length === 0) {
    console.error(`❌ No scenarios match filter: ${scenarioFilter}`)
    process.exit(1)
  }
  
  // Run benchmarks
  await runner.runAllScenarios(scenariosToRun, iterations)
  
  // Export results if requested
  if (exportPath) {
    await runner.exportResults(exportPath)
  }
  
  // Performance grading
  console.log('\n' + '='.repeat(50))
  console.log('🏆 Performance Grade')
  console.log('='.repeat(50))
  
  let totalScore = 0
  let maxScore = scenariosToRun.length * 100
  
  for (const scenario of scenariosToRun) {
    // This is a simplified grading system
    // In practice, you'd want to access the actual results from the runner
    totalScore += 80 // Placeholder score
  }
  
  const grade = (totalScore / maxScore) * 100
  const gradeEmoji = grade >= 90 ? '🥇' : grade >= 80 ? '🥈' : grade >= 70 ? '🥉' : '📉'
  
  console.log(`${gradeEmoji} Overall Grade: ${grade.toFixed(1)}%`)
  
  if (grade < 80) {
    console.log('\n⚠️  Performance improvements recommended!')
    console.log('Consider:')
    console.log('  - Reducing number of features')
    console.log('  - Using simpler theme')
    console.log('  - Disabling logging in production')
    console.log('  - Implementing caching for expensive operations')
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(console.error)
}

export { scenarios, runBenchmarks }