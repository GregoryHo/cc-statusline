import { spawn } from 'child_process'
import * as os from 'os'
import { performance } from 'perf_hooks'

export interface SystemMetrics {
  timestamp: number
  cpu: {
    usage: number
    loadAvg: number[]
    cores: number
  }
  memory: {
    total: number
    free: number
    used: number
    usagePercent: number
  }
  process?: {
    pid: number
    cpu: number
    memory: number
  }
}

export class PerformanceMonitor {
  private metrics: SystemMetrics[] = []
  private interval: NodeJS.Timeout | null = null
  private processToMonitor: number | null = null
  
  startMonitoring(intervalMs: number = 100, pid?: number) {
    this.processToMonitor = pid || null
    this.metrics = []
    
    this.interval = setInterval(() => {
      this.collectMetrics()
    }, intervalMs)
  }
  
  stopMonitoring(): SystemMetrics[] {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    return this.metrics
  }
  
  private collectMetrics() {
    const cpus = os.cpus()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    const metric: SystemMetrics = {
      timestamp: performance.now(),
      cpu: {
        usage: this.calculateCPUUsage(cpus),
        loadAvg: os.loadavg(),
        cores: cpus.length
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usagePercent: (usedMem / totalMem) * 100
      }
    }
    
    if (this.processToMonitor) {
      metric.process = this.getProcessMetrics(this.processToMonitor)
    }
    
    this.metrics.push(metric)
  }
  
  private calculateCPUUsage(cpus: os.CpuInfo[]): number {
    let totalIdle = 0
    let totalTick = 0
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times]
      }
      totalIdle += cpu.times.idle
    })
    
    return 100 - ((totalIdle / totalTick) * 100)
  }
  
  private getProcessMetrics(pid: number): { pid: number, cpu: number, memory: number } | undefined {
    // This is a simplified version - in production you'd want to use a library like pidusage
    try {
      // For now, return placeholder values
      // In a real implementation, you'd read from /proc/[pid]/stat on Linux
      return {
        pid,
        cpu: 0,
        memory: 0
      }
    } catch {
      return undefined
    }
  }
  
  getAverageMetrics(): {
    avgCPU: number
    avgMemory: number
    maxCPU: number
    maxMemory: number
    minCPU: number
    minMemory: number
  } {
    if (this.metrics.length === 0) {
      return {
        avgCPU: 0,
        avgMemory: 0,
        maxCPU: 0,
        maxMemory: 0,
        minCPU: 0,
        minMemory: 0
      }
    }
    
    const cpuValues = this.metrics.map(m => m.cpu.usage)
    const memValues = this.metrics.map(m => m.memory.usagePercent)
    
    return {
      avgCPU: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
      avgMemory: memValues.reduce((a, b) => a + b, 0) / memValues.length,
      maxCPU: Math.max(...cpuValues),
      maxMemory: Math.max(...memValues),
      minCPU: Math.min(...cpuValues),
      minMemory: Math.min(...memValues)
    }
  }
  
  generateReport(): string {
    const stats = this.getAverageMetrics()
    const duration = this.metrics.length > 0 
      ? this.metrics[this.metrics.length - 1].timestamp - this.metrics[0].timestamp
      : 0
    
    return `
Performance Monitoring Report
=============================
Duration: ${duration.toFixed(2)}ms
Samples: ${this.metrics.length}

CPU Usage:
  Average: ${stats.avgCPU.toFixed(2)}%
  Maximum: ${stats.maxCPU.toFixed(2)}%
  Minimum: ${stats.minCPU.toFixed(2)}%

Memory Usage:
  Average: ${stats.avgMemory.toFixed(2)}%
  Maximum: ${stats.maxMemory.toFixed(2)}%
  Minimum: ${stats.minMemory.toFixed(2)}%
`
  }
}

export class BashProcessMonitor {
  async monitorBashExecution(
    scriptPath: string,
    input: string
  ): Promise<{
    exitCode: number
    executionTime: number
    peakMemory: number
    output: string
    error?: string
    systemMetrics: SystemMetrics[]
  }> {
    const monitor = new PerformanceMonitor()
    const startTime = performance.now()
    let peakMemory = 0
    
    return new Promise((resolve) => {
      const proc = spawn('bash', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      // Start monitoring
      monitor.startMonitoring(50, proc.pid)
      
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
        const metrics = monitor.stopMonitoring()
        
        // Calculate peak memory from metrics
        if (metrics.length > 0) {
          peakMemory = Math.max(...metrics.map(m => m.memory.used))
        }
        
        resolve({
          exitCode: code || 0,
          executionTime: endTime - startTime,
          peakMemory,
          output: stdout.trim(),
          error: stderr.trim() || undefined,
          systemMetrics: metrics
        })
      })
      
      proc.on('error', (err) => {
        const endTime = performance.now()
        const metrics = monitor.stopMonitoring()
        
        resolve({
          exitCode: 1,
          executionTime: endTime - startTime,
          peakMemory: 0,
          output: '',
          error: err.message,
          systemMetrics: metrics
        })
      })
      
      // Send input
      proc.stdin.write(input)
      proc.stdin.end()
      
      // Timeout
      setTimeout(() => {
        proc.kill()
        const metrics = monitor.stopMonitoring()
        resolve({
          exitCode: 124,
          executionTime: 5000,
          peakMemory: 0,
          output: stdout,
          error: 'Timeout',
          systemMetrics: metrics
        })
      }, 5000)
    })
  }
}

// Export utilities for chart generation
export function generateASCIIChart(
  values: number[],
  width: number = 50,
  height: number = 10,
  label?: string
): string {
  if (values.length === 0) return 'No data'
  
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  
  const chart: string[] = []
  
  // Title
  if (label) {
    chart.push(label)
    chart.push('─'.repeat(width))
  }
  
  // Create chart rows
  for (let row = height - 1; row >= 0; row--) {
    const threshold = min + (range * row / (height - 1))
    let line = ''
    
    for (let col = 0; col < Math.min(width, values.length); col++) {
      const valueIndex = Math.floor(col * values.length / width)
      const value = values[valueIndex]
      
      if (value >= threshold) {
        line += '█'
      } else {
        line += ' '
      }
    }
    
    // Add axis label
    const axisLabel = threshold.toFixed(1).padStart(6)
    chart.push(`${axisLabel} │${line}`)
  }
  
  // Add bottom axis
  chart.push('       └' + '─'.repeat(width))
  
  return chart.join('\n')
}

export default PerformanceMonitor