# Performance Testing Guide

## Overview

The cc-statusline performance testing suite provides comprehensive tools to measure, monitor, and optimize statusline execution speed. The suite includes TypeScript-based benchmarking, bash stress testing, and system monitoring utilities.

## Quick Start

```bash
# Build the project
npm run build

# Run the full benchmark suite
npx tsx test/performance/benchmark.ts

# Run stress tests
./test/performance/stress-test.sh

# Test current statusline performance
./dist/index.js preview ./.claude/statusline.sh
```

## Test Components

### 1. Performance Test Framework (`perf-test.ts`)
- Core testing framework with metrics collection
- Measures execution time, memory usage, and CPU utilization
- Supports multiple iterations for statistical analysis
- Provides percentile calculations (P95, P99)

### 2. Benchmark Suite (`benchmark.ts`)
- Pre-configured test scenarios
- Tests different feature combinations
- Compares performance across configurations
- Generates performance reports

### 3. Stress Testing (`stress-test.sh`)
- Bash-based stress testing
- Tests concurrent execution
- Rapid-fire sequential calls
- Memory-constrained environments
- Large input handling

### 4. Performance Monitor (`monitor.ts`)
- Real-time system metrics collection
- CPU and memory usage tracking
- Process-specific monitoring
- ASCII chart generation for visualization

## Performance Targets

| Scenario | Target | Acceptable | Warning |
|----------|--------|------------|---------|
| Minimal (directory only) | <50ms | <100ms | >100ms |
| Standard (dir + git + model) | <100ms | <200ms | >200ms |
| Full (no ccusage) | <150ms | <300ms | >300ms |
| Full (with ccusage) | <300ms | <500ms | >500ms |

## Current Performance Baseline

Based on testing (macOS, Node v20):

| Configuration | Average Time | Status |
|--------------|-------------|---------|
| Minimal | ~50ms | ✅ Excellent |
| Standard | ~100ms | ✅ Good |
| Full (no ccusage) | ~150ms | ✅ Acceptable |
| Full (with ccusage) | ~3900ms | 🔴 Too Slow |

**Note**: ccusage integration adds significant latency (~2-3 seconds) due to external command execution.

## Running Tests

### Basic Performance Test
```bash
# Test with default settings (10 iterations)
npx tsx test/performance/benchmark.ts

# Test with more iterations for accuracy
npx tsx test/performance/benchmark.ts --iterations 50

# Test specific scenario
npx tsx test/performance/benchmark.ts --scenario minimal

# Export results to JSON
npx tsx test/performance/benchmark.ts --export results.json
```

### Stress Testing
```bash
# Run full stress test suite
./test/performance/stress-test.sh

# Results are logged to /tmp/cc-statusline-stress/stress-test.log
```

### Manual Testing
```bash
# Time a single execution
time echo '{"workspace":{"current_dir":"/test"},"model":{"display_name":"Claude"}}' | bash ./.claude/statusline.sh

# Test with preview command (includes timing)
./dist/index.js preview ./.claude/statusline.sh
```

## Performance Optimization Tips

### 1. Feature Selection
- Only enable features you actually use
- Consider disabling ccusage integration if speed is critical
- Use minimal theme for fastest performance

### 2. Configuration Optimization
```javascript
// Fastest configuration
{
  features: ['directory'],
  theme: 'minimal',
  colors: false,
  ccusageIntegration: false,
  logging: false
}

// Balanced configuration
{
  features: ['directory', 'git', 'model'],
  theme: 'default',
  colors: true,
  ccusageIntegration: false,
  logging: false
}
```

### 3. System Optimization
- Ensure `jq` is installed for faster JSON parsing
- Use SSD for better file I/O performance
- Close unnecessary applications during testing

## Known Performance Issues

1. **ccusage Integration**: Adds 2-3 seconds latency
   - Solution: Consider caching or async loading
   
2. **Large JSON Parsing**: Bash fallback is slow for large inputs
   - Solution: Always install `jq` for better performance

3. **Git Operations**: Can be slow in large repositories
   - Solution: Consider caching git status

## Monitoring Performance

### Real-time Monitoring
```typescript
import { PerformanceMonitor } from './test/performance/monitor.js'

const monitor = new PerformanceMonitor()
monitor.startMonitoring(100) // Sample every 100ms

// Run your statusline...

const metrics = monitor.stopMonitoring()
console.log(monitor.generateReport())
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Performance Tests
  run: |
    npm run build
    npx tsx test/performance/benchmark.ts --export perf-results.json
    
- name: Check Performance
  run: |
    # Add script to check if performance meets targets
    node scripts/check-performance.js perf-results.json
```

## Troubleshooting

### Slow Execution
1. Check if ccusage is enabled: `grep ccusage ./.claude/statusline.sh`
2. Verify jq is installed: `which jq`
3. Check system resources: `top` or `htop`
4. Review statusline.log for timing details

### Inconsistent Results
1. Run more iterations: `--iterations 50`
2. Close other applications
3. Disable logging during tests
4. Use performance monitoring to identify bottlenecks

## Future Improvements

- [ ] Implement caching for expensive operations
- [ ] Add async loading for ccusage data
- [ ] Optimize bash JSON parsing fallback
- [ ] Add performance regression testing
- [ ] Create performance dashboard
- [ ] Implement lazy loading for optional features

## Contributing

When adding new features:
1. Run performance tests before and after changes
2. Document any performance impact
3. Add new test scenarios if needed
4. Update performance targets if justified

## Resources

- [Bash Performance Tips](https://www.gnu.org/software/bash/manual/html_node/Bash-Performance.html)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [JSON Parsing Performance](https://stedolan.github.io/jq/manual/)