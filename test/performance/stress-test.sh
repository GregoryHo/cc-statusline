#!/bin/bash

# CC-Statusline Stress Testing Script
# Tests performance under various stress conditions

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATUSLINE_SCRIPT="$PROJECT_ROOT/.claude/statusline.sh"
TEMP_DIR="/tmp/cc-statusline-stress"
LOG_FILE="$TEMP_DIR/stress-test.log"

# Test parameters
CONCURRENT_CALLS=10
RAPID_FIRE_COUNT=100
LARGE_JSON_SIZE=10485760  # 10MB
MEMORY_LIMIT="50M"  # Memory limit for constrained tests

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Setup
setup() {
  echo -e "${CYAN}Setting up stress test environment...${NC}"
  mkdir -p "$TEMP_DIR"
  > "$LOG_FILE"
  
  # Check if statusline exists
  if [ ! -f "$STATUSLINE_SCRIPT" ]; then
    echo -e "${YELLOW}Warning: Statusline not found at $STATUSLINE_SCRIPT${NC}"
    echo -e "${GRAY}Building and generating statusline...${NC}"
    cd "$PROJECT_ROOT"
    npm run build
    ./dist/index.js init --no-install
  fi
}

# Cleanup
cleanup() {
  echo -e "${GRAY}Cleaning up...${NC}"
  rm -rf "$TEMP_DIR"
}

# Generate mock input
generate_mock_input() {
  local size="${1:-normal}"
  
  case "$size" in
    small)
      echo '{"session_id":"test","workspace":{"current_dir":"/test"},"model":{"display_name":"Claude"}}'
      ;;
    normal)
      cat <<EOF
{
  "session_id": "test-session-123",
  "workspace": {"current_dir": "/home/user/projects/test"},
  "model": {"display_name": "Opus 4.1", "version": "20250805"},
  "version": "1.3.2",
  "output_style": {"name": "detailed"},
  "cost": {"total_cost_usd": 3.42, "total_duration_ms": 987654}
}
EOF
      ;;
    large)
      # Generate large JSON with padding
      local base='{"session_id":"test","workspace":{"current_dir":"/test"},"model":{"display_name":"Claude"},'
      local padding='"padding":"'
      for i in $(seq 1 $((LARGE_JSON_SIZE / 100))); do
        padding="${padding}x"
      done
      padding="${padding}\"}"
      echo "${base}${padding}"
      ;;
  esac
}

# Test single execution
test_single_execution() {
  local name="$1"
  local input="$2"
  local timeout="${3:-1}"
  
  echo -e "\n${CYAN}Test: $name${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))
  
  # Use perl for high-resolution timing (macOS compatible)
  local start_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  local output
  local exit_code
  
  if command -v timeout >/dev/null 2>&1; then
    output=$(echo "$input" | timeout "$timeout" bash "$STATUSLINE_SCRIPT" 2>&1)
    exit_code=$?
  elif command -v gtimeout >/dev/null 2>&1; then
    output=$(echo "$input" | gtimeout "$timeout" bash "$STATUSLINE_SCRIPT" 2>&1)
    exit_code=$?
  else
    output=$(echo "$input" | bash "$STATUSLINE_SCRIPT" 2>&1)
    exit_code=$?
  fi
  
  local end_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  local execution_time=$(( end_time - start_time ))  # Already in ms
  
  if [ $exit_code -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Passed (${execution_time}ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "[PASS] $name: ${execution_time}ms" >> "$LOG_FILE"
  else
    echo -e "  ${RED}✗${NC} Failed (exit code: $exit_code, time: ${execution_time}ms)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "[FAIL] $name: exit_code=$exit_code, time=${execution_time}ms" >> "$LOG_FILE"
    echo "Output: $output" >> "$LOG_FILE"
  fi
  
  return $exit_code
}

# Test concurrent execution
test_concurrent() {
  echo -e "\n${CYAN}Test: Concurrent Execution (${CONCURRENT_CALLS} simultaneous calls)${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))
  
  local input=$(generate_mock_input normal)
  local pids=()
  local failures=0
  
  echo -e "  Launching ${CONCURRENT_CALLS} processes..."
  local start_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  
  for i in $(seq 1 $CONCURRENT_CALLS); do
    (echo "$input" | bash "$STATUSLINE_SCRIPT" > "$TEMP_DIR/concurrent_$i.out" 2>&1) &
    pids+=($!)
  done
  
  # Wait for all processes
  for pid in "${pids[@]}"; do
    wait $pid
    [ $? -ne 0 ] && failures=$((failures + 1))
  done
  
  local end_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  local total_time=$(( end_time - start_time ))
  local avg_time=$(( total_time / CONCURRENT_CALLS ))
  
  if [ $failures -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All concurrent calls succeeded"
    echo -e "  Total time: ${total_time}ms, Average: ${avg_time}ms"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "  ${RED}✗${NC} $failures/$CONCURRENT_CALLS calls failed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test rapid fire execution
test_rapid_fire() {
  echo -e "\n${CYAN}Test: Rapid Fire (${RAPID_FIRE_COUNT} sequential calls)${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))
  
  local input=$(generate_mock_input small)
  local failures=0
  local total_time=0
  
  echo -e "  Executing ${RAPID_FIRE_COUNT} calls..."
  
  for i in $(seq 1 $RAPID_FIRE_COUNT); do
    local start=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
    echo "$input" | bash "$STATUSLINE_SCRIPT" > /dev/null 2>&1
    local exit_code=$?
    local end=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
    
    if [ $exit_code -ne 0 ]; then
      failures=$((failures + 1))
    fi
    
    total_time=$(( total_time + (end - start) ))
    
    # Progress indicator
    if [ $((i % 10)) -eq 0 ]; then
      printf "\r  Progress: %d/%d" "$i" "$RAPID_FIRE_COUNT"
    fi
  done
  
  local avg_time=$(( total_time / RAPID_FIRE_COUNT ))
  printf "\r  Progress: %d/%d\n" "$RAPID_FIRE_COUNT" "$RAPID_FIRE_COUNT"
  
  if [ $failures -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} All rapid fire calls succeeded"
    echo -e "  Total time: ${total_time}ms, Average: ${avg_time}ms"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "  ${RED}✗${NC} $failures/$RAPID_FIRE_COUNT calls failed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test memory constrained execution
test_memory_constrained() {
  echo -e "\n${CYAN}Test: Memory Constrained Execution (limit: $MEMORY_LIMIT)${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))
  
  # Check if ulimit is available
  if ! command -v ulimit >/dev/null 2>&1; then
    echo -e "  ${YELLOW}⚠${NC} ulimit not available, skipping test"
    return
  fi
  
  local input=$(generate_mock_input normal)
  
  # Run with memory limit in a subshell
  (
    ulimit -v 51200  # 50MB in KB
    echo "$input" | bash "$STATUSLINE_SCRIPT" > /dev/null 2>&1
  )
  local exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Executed successfully under memory constraints"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "  ${RED}✗${NC} Failed under memory constraints"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test large input handling
test_large_input() {
  echo -e "\n${CYAN}Test: Large Input Handling (${LARGE_JSON_SIZE} bytes)${NC}"
  TESTS_RUN=$((TESTS_RUN + 1))
  
  echo -e "  Generating large JSON..."
  local input=$(generate_mock_input large)
  local input_size=${#input}
  echo -e "  Input size: ${input_size} bytes"
  
  local start_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  if command -v gtimeout >/dev/null 2>&1; then
    echo "$input" | gtimeout 5 bash "$STATUSLINE_SCRIPT" > /dev/null 2>&1
  else
    echo "$input" | timeout 5 bash "$STATUSLINE_SCRIPT" > /dev/null 2>&1
  fi
  local exit_code=$?
  local end_time=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
  local execution_time=$(( end_time - start_time ))
  
  if [ $exit_code -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Handled large input successfully (${execution_time}ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  elif [ $exit_code -eq 124 ]; then
    echo -e "  ${RED}✗${NC} Timeout handling large input"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  else
    echo -e "  ${RED}✗${NC} Failed handling large input"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Performance baseline test
test_performance_baseline() {
  echo -e "\n${CYAN}Performance Baseline Tests${NC}"
  echo -e "${GRAY}Testing execution times for different input sizes...${NC}"
  
  local sizes=("small" "normal")
  local expected_times=(50 100)  # Expected max times in ms
  
  for i in "${!sizes[@]}"; do
    local size="${sizes[$i]}"
    local expected="${expected_times[$i]}"
    local input=$(generate_mock_input "$size")
    
    local times=()
    echo -e "\n  Testing $size input (5 iterations)..."
    
    for j in {1..5}; do
      local start=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
      echo "$input" | bash "$STATUSLINE_SCRIPT" > /dev/null 2>&1
      local end=$(perl -MTime::HiRes=time -e 'printf "%.0f\n", time*1000')
      local time=$(( end - start ))
      times+=($time)
      printf "\r    Iteration %d: %dms" "$j" "$time"
    done
    
    # Calculate average
    local sum=0
    for t in "${times[@]}"; do
      sum=$((sum + t))
    done
    local avg=$((sum / 5))
    
    printf "\r    Average: %dms (expected <%dms) " "$avg" "$expected"
    
    if [ $avg -le $expected ]; then
      echo -e "${GREEN}✓${NC}"
    else
      echo -e "${YELLOW}⚠ Slower than expected${NC}"
    fi
  done
}

# Main test execution
main() {
  echo -e "${CYAN}================================${NC}"
  echo -e "${CYAN}CC-Statusline Stress Test Suite${NC}"
  echo -e "${CYAN}================================${NC}"
  echo -e "Date: $(date)"
  echo -e "Platform: $(uname -s)"
  echo -e "Statusline: $STATUSLINE_SCRIPT"
  
  setup
  
  # Run all stress tests
  test_single_execution "Basic Execution" "$(generate_mock_input normal)"
  test_single_execution "Minimal Input" "$(generate_mock_input small)"
  test_concurrent
  test_rapid_fire
  test_memory_constrained
  test_large_input
  test_performance_baseline
  
  # Summary
  echo -e "\n${CYAN}================================${NC}"
  echo -e "${CYAN}Stress Test Summary${NC}"
  echo -e "${CYAN}================================${NC}"
  echo -e "Total:  $TESTS_RUN"
  echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"
  
  # Performance recommendations
  if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${YELLOW}⚠ Performance Issues Detected${NC}"
    echo -e "Recommendations:"
    echo -e "  • Check for memory leaks in bash script"
    echo -e "  • Optimize JSON parsing for large inputs"
    echo -e "  • Consider implementing caching mechanisms"
    echo -e "  • Review concurrent execution handling"
  else
    echo -e "\n${GREEN}✨ All stress tests passed!${NC}"
  fi
  
  echo -e "\n${GRAY}Log file: $LOG_FILE${NC}"
  
  cleanup
  
  [ $TESTS_FAILED -eq 0 ]
}

# Handle interrupts
trap cleanup EXIT INT TERM

# Run tests
main