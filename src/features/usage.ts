export interface UsageFeature {
  enabled: boolean
  showCost: boolean
  showTokens: boolean
  showBurnRate: boolean
  showSession: boolean
  showProgressBar: boolean
}

export function generateUsageBashCode(config: UsageFeature, colors: boolean): string {
  if (!config.enabled) return ''

  const colorCode = colors ? `
# ---- usage colors ----
usage_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;111m'; fi; }  # deep sky blue
cost_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;226m'; fi; }   # bright yellow (high visibility)
burn_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;220m'; fi; }   # bright gold
session_color() { 
  rem_pct=$(( 100 - session_pct ))
  if   (( rem_pct <= 10 )); then SCLR='38;5;196'  # bright red (critical)
  elif (( rem_pct <= 25 )); then SCLR='38;5;208'  # orange (warning)
  else                          SCLR='38;5;120'; fi  # bright green (good)
  if [ "$use_color" -eq 1 ]; then printf '\\033[%sm' "$SCLR"; fi
}
` : `
usage_color() { :; }
cost_color() { :; }
burn_color() { :; }
session_color() { :; }
`

  return `${colorCode}
# ---- cost and usage extraction ----
session_txt=""; session_pct=0; session_bar=""
cost_usd=""; cost_per_hour=""; tpm=""; tot_tokens=""

# Extract cost data from Claude Code input
if [ "$HAS_JQ" -eq 1 ]; then
  # Get cost data from Claude Code's input
  cost_usd=$(echo "$input" | jq -r '.cost.total_cost_usd // empty' 2>/dev/null)
  total_duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // empty' 2>/dev/null)
  
  # Calculate burn rate ($/hour) from cost and duration
  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    # Convert ms to hours and calculate rate
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi
else
  # Bash fallback for cost extraction
  cost_usd=$(echo "$input" | grep -o '"total_cost_usd"[[:space:]]*:[[:space:]]*[0-9.]*' | sed 's/.*:[[:space:]]*\\([0-9.]*\\).*/\\1/')
  total_duration_ms=$(echo "$input" | grep -o '"total_duration_ms"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\\([0-9]*\\).*/\\1/')  
  
  # Calculate burn rate ($/hour) from cost and duration
  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    # Convert ms to hours and calculate rate
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi
fi

# Get token data and session info from ccusage if available
if command -v ccusage >/dev/null 2>&1 && [ "$HAS_JQ" -eq 1 ]; then
  blocks_output=""
  
  # Try ccusage with timeout for token data and session info
  if command -v timeout >/dev/null 2>&1; then
    blocks_output=$(timeout 5s ccusage blocks --json 2>/dev/null)
  elif command -v gtimeout >/dev/null 2>&1; then
    # macOS with coreutils installed
    blocks_output=$(gtimeout 5s ccusage blocks --json 2>/dev/null)
  else
    # No timeout available, run directly (ccusage should be fast)
    blocks_output=$(ccusage blocks --json 2>/dev/null)
  fi
  if [ -n "$blocks_output" ]; then
    active_block=$(echo "$blocks_output" | jq -c '.blocks[] | select(.isActive == true)' 2>/dev/null | head -n1)
    if [ -n "$active_block" ]; then${config.showTokens ? `
      # Get token count from ccusage
      tot_tokens=$(echo "$active_block" | jq -r '.totalTokens // empty')` : ''}${config.showBurnRate && config.showTokens ? `
      # Get tokens per minute from ccusage
      tpm=$(echo "$active_block" | jq -r '.burnRate.tokensPerMinute // empty')` : ''}${config.showSession || config.showProgressBar ? `
      
      # Session time calculation from ccusage
      reset_time_str=$(echo "$active_block" | jq -r '.usageLimitResetTime // .endTime // empty')
      start_time_str=$(echo "$active_block" | jq -r '.startTime // empty')
      
      if [ -n "$reset_time_str" ] && [ -n "$start_time_str" ]; then
        start_sec=$(to_epoch "$start_time_str"); end_sec=$(to_epoch "$reset_time_str"); now_sec=$(date +%s)
        total=$(( end_sec - start_sec )); (( total<1 )) && total=1
        elapsed=$(( now_sec - start_sec )); (( elapsed<0 ))&&elapsed=0; (( elapsed>total ))&&elapsed=$total
        session_pct=$(( elapsed * 100 / total ))
        remaining=$(( end_sec - now_sec )); (( remaining<0 )) && remaining=0
        rh=$(( remaining / 3600 )); rm=$(( (remaining % 3600) / 60 ))
        end_hm=$(fmt_time_hm "$end_sec")${config.showSession ? `
        session_txt="$(printf '%dh %dm until reset at %s (%d%%)' "$rh" "$rm" "$end_hm" "$session_pct")"` : ''}${config.showProgressBar ? `
        session_bar=$(progress_bar "$session_pct" 10)` : ''}
      fi` : ''}
    fi
  fi
fi`
}

export function generateUsageUtilities(): string {
  return `
# ---- time helpers ----
to_epoch() {
  ts="$1"
  if command -v gdate >/dev/null 2>&1; then gdate -d "$ts" +%s 2>/dev/null && return; fi
  date -u -j -f "%Y-%m-%dT%H:%M:%S%z" "\${ts/Z/+0000}" +%s 2>/dev/null && return
  python3 - "$ts" <<'PY' 2>/dev/null
import sys, datetime
s=sys.argv[1].replace('Z','+00:00')
print(int(datetime.datetime.fromisoformat(s).timestamp()))
PY
}

fmt_time_hm() {
  epoch="$1"
  if date -r 0 +%s >/dev/null 2>&1; then date -r "$epoch" +"%H:%M"; else date -d "@$epoch" +"%H:%M"; fi
}

progress_bar() {
  pct="\${1:-0}"; width="\${2:-10}"
  [[ "$pct" =~ ^[0-9]+$ ]] || pct=0; ((pct<0))&&pct=0; ((pct>100))&&pct=100
  filled=$(( pct * width / 100 )); empty=$(( width - filled ))
  printf '%*s' "$filled" '' | tr ' ' '▓'
  printf '%*s' "$empty" '' | tr ' ' '░'
}

format_number() {
  local num="\$1"
  # Only format if it's a valid number
  if [[ "\$num" =~ ^[0-9]+$ ]] && [ "\$num" -gt 999 ]; then
    # Reverse the number, add commas every 3 digits, then reverse back
    echo "\$num" | rev | sed 's/.../&,/g' | sed 's/,$//g' | rev
  else
    echo "\$num"
  fi
}`
}

export function generateUsageDisplayCode(config: UsageFeature, colors: boolean, emojis: boolean): string {
  if (!config.enabled) return ''

  let displayCode = ''

  if (config.showSession) {
    const sessionEmoji = emojis ? '⌛' : 'session:'
    displayCode += `
# session time
if [ -n "$session_txt" ]; then
  printf '  ${sessionEmoji} %s%s%s' "$(session_color)" "$session_txt" "$(rst)"${config.showProgressBar ? `
  printf '  %s[%s]%s' "$(session_color)" "$session_bar" "$(rst)"` : ''}
fi`
  }

  if (config.showCost) {
    const costEmoji = emojis ? '💵' : '$'
    displayCode += `
# cost
if [ -n "$cost_usd" ] && [[ "$cost_usd" =~ ^[0-9.]+$ ]]; then
  if [ -n "$cost_per_hour" ] && [[ "$cost_per_hour" =~ ^[0-9.]+$ ]]; then
    printf '  ${costEmoji} %s$%.2f ($%.2f/h)%s' "$(cost_color)" "$cost_usd" "$cost_per_hour" "$(rst)"
  else
    printf '  ${costEmoji} %s$%.2f%s' "$(cost_color)" "$cost_usd" "$(rst)"
  fi
fi`
  }

  if (config.showTokens) {
    const tokenEmoji = emojis ? '📊' : 'tokens:'
    displayCode += `
# tokens
if [ -n "$tot_tokens" ] && [[ "$tot_tokens" =~ ^[0-9]+$ ]]; then
  if [ -n "$tpm" ] && [[ "$tpm" =~ ^[0-9.]+$ ]] && ${config.showBurnRate ? 'true' : 'false'}; then
    formatted_tokens=$(format_number "$tot_tokens")
    formatted_tpm=$(format_number "$(printf '%.0f' "$tpm")")
    printf '  ${tokenEmoji} %s%s tokens (%s tpm)%s' "$(usage_color)" "$formatted_tokens" "$formatted_tpm" "$(rst)"
  else
    formatted_tokens=$(format_number "$tot_tokens")
    printf '  ${tokenEmoji} %s%s tokens%s' "$(usage_color)" "$formatted_tokens" "$(rst)"
  fi
fi`
  }

  return displayCode
}