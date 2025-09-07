import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import { generateBashStatusline } from '../../src/generators/bash-generator.js'
import { StatuslineConfig } from '../../src/cli/prompts.js'

export interface PerformanceMetrics {
  executionTime: number
  memoryUsage: number
  cpuTime: number
  successful: boolean
  output: string
  error?: string
}

export interface TestScenario {
  name: string
  description: string
  config: StatuslineConfig
  mockData: any
  expectedTime: number // Expected max time in ms
}

export class PerformanceTestRunner {
  private results: Map<string, PerformanceMetrics[]> = new Map()
  
  async runScenario(scenario: TestScenario, iterations: number = 10): Promise<PerformanceMetrics[]> {
    console.log(`\n🧪 Testing: ${scenario.name}`)
    console.log(`   ${scenario.description}`)
    console.log(`   Iterations: ${iterations}`)
    
    const metrics: PerformanceMetrics[] = []
    
    // Generate the statusline script once
    const script = generateBashStatusline(scenario.config)
    const tempDir = '/tmp/cc-statusline-perf'
    await fs.mkdir(tempDir, { recursive: true })
    const scriptPath = path.join(tempDir, `test-${Date.now()}.sh`)
    await fs.writeFile(scriptPath, script, { mode: 0o755 })
    
    // Run multiple iterations
    for (let i = 0; i < iterations; i++) {
      const metric = await this.measureExecution(scriptPath, scenario.mockData)
      metrics.push(metric)
      
      // Progress indicator
      process.stdout.write(`\r   Progress: ${i + 1}/${iterations}`)
    }
    
    // Cleanup
    await fs.unlink(scriptPath).catch(() => {})
    
    // Store results
    this.results.set(scenario.name, metrics)
    
    // Print summary
    this.printScenarioSummary(scenario, metrics)
    
    return metrics
  }
  
  private async measureExecution(scriptPath: string, mockData: any): Promise<PerformanceMetrics> {
    const startTime = performance.now()
    const startUsage = process.cpuUsage()
    const startMemory = process.memoryUsage()
    
    return new Promise((resolve) => {
      const proc = spawn('bash', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let stdout = ''
      let stderr = ''
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      proc.on('close', (code) => {
        const endTime = performance.now()
        const endUsage = process.cpuUsage(startUsage)
        const endMemory = process.memoryUsage()
        
        resolve({
          executionTime: endTime - startTime,
          memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
          cpuTime: (endUsage.user + endUsage.system) / 1000, // Convert to ms
          successful: code === 0,
          output: stdout.trim(),
          error: stderr.trim() || undefined
        })
      })
      
      proc.on('error', (err) => {
        const endTime = performance.now()
        resolve({
          executionTime: endTime - startTime,
          memoryUsage: 0,
          cpuTime: 0,
          successful: false,
          output: '',
          error: err.message
        })
      })
      
      // Send input
      proc.stdin.write(JSON.stringify(mockData))
      proc.stdin.end()
      
      // Timeout after 2 seconds
      setTimeout(() => {
        proc.kill()
        const endTime = performance.now()
        resolve({
          executionTime: endTime - startTime,
          memoryUsage: 0,
          cpuTime: 0,
          successful: false,
          output: stdout,
          error: 'Timeout (2s)'
        })
      }, 2000)
    })
  }
  
  private printScenarioSummary(scenario: TestScenario, metrics: PerformanceMetrics[]) {
    const times = metrics.map(m => m.executionTime)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)
    const median = this.calculateMedian(times)
    const p95 = this.calculatePercentile(times, 95)
    const successRate = (metrics.filter(m => m.successful).length / metrics.length) * 100
    
    console.log('\n')
    console.log(`   ✅ Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`   ⏱️  Average: ${avg.toFixed(2)}ms ${this.getPerformanceEmoji(avg, scenario.expectedTime)}`)
    console.log(`   📊 Median:  ${median.toFixed(2)}ms`)
    console.log(`   🚀 Min:     ${min.toFixed(2)}ms`)
    console.log(`   🐌 Max:     ${max.toFixed(2)}ms`)
    console.log(`   📈 P95:     ${p95.toFixed(2)}ms`)
    
    if (avg > scenario.expectedTime) {
      console.log(`   ⚠️  Performance below expectations (expected <${scenario.expectedTime}ms)`)
    }
  }
  
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }
  
  private getPerformanceEmoji(time: number, expected: number): string {
    const ratio = time / expected
    if (ratio < 0.5) return '🚀 Excellent'
    if (ratio < 0.8) return '✅ Good'
    if (ratio < 1.0) return '👍 Acceptable'
    if (ratio < 1.5) return '⚠️  Slow'
    return '🔴 Too Slow'
  }
  
  async runAllScenarios(scenarios: TestScenario[], iterations: number = 10) {
    console.log('🏁 Starting Performance Test Suite')
    console.log('='.repeat(50))
    
    for (const scenario of scenarios) {
      await this.runScenario(scenario, iterations)
    }
    
    this.printOverallSummary()
  }
  
  private printOverallSummary() {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Overall Performance Summary')
    console.log('='.repeat(50))
    
    const summaryData: any[] = []
    
    for (const [name, metrics] of this.results) {
      const times = metrics.map(m => m.executionTime)
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const median = this.calculateMedian(times)
      const p95 = this.calculatePercentile(times, 95)
      
      summaryData.push({
        Scenario: name,
        'Avg (ms)': avg.toFixed(2),
        'Median (ms)': median.toFixed(2),
        'P95 (ms)': p95.toFixed(2),
        'Success %': ((metrics.filter(m => m.successful).length / metrics.length) * 100).toFixed(0)
      })
    }
    
    console.table(summaryData)
    
    // Performance recommendations
    console.log('\n💡 Recommendations:')
    for (const [name, metrics] of this.results) {
      const avg = metrics.map(m => m.executionTime).reduce((a, b) => a + b, 0) / metrics.length
      if (avg > 500) {
        console.log(`   - ${name}: Consider optimizing or reducing features (${avg.toFixed(0)}ms avg)`)
      }
    }
  }
  
  async exportResults(outputPath: string) {
    const report = {
      timestamp: new Date().toISOString(),
      results: Object.fromEntries(this.results),
      summary: this.generateSummaryStats()
    }
    
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n📁 Results exported to: ${outputPath}`)
  }
  
  private generateSummaryStats() {
    const summary: any = {}
    
    for (const [name, metrics] of this.results) {
      const times = metrics.map(m => m.executionTime)
      summary[name] = {
        iterations: metrics.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        median: this.calculateMedian(times),
        min: Math.min(...times),
        max: Math.max(...times),
        p95: this.calculatePercentile(times, 95),
        p99: this.calculatePercentile(times, 99),
        successRate: (metrics.filter(m => m.successful).length / metrics.length) * 100
      }
    }
    
    return summary
  }
}

// Export for use in other test files
export default PerformanceTestRunner