import chalk from 'chalk'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface DiagnosticResult {
  name: string
  status: 'pass' | 'fail' | 'warn' | 'info'
  message: string
  details?: string
}

function checkJq(): DiagnosticResult {
  try {
    const version = execSync('jq --version', { encoding: 'utf-8' }).trim()
    return {
      name: 'jq Installation',
      status: 'pass',
      message: `jq is installed: ${version}`
    }
  } catch {
    return {
      name: 'jq Installation',
      status: 'fail',
      message: 'jq is NOT installed',
      details: 'Context remaining feature requires jq. Install with: brew install jq (macOS) or apt-get install jq (Linux)'
    }
  }
}

function checkStatuslineFile(): DiagnosticResult {
  const projectPath = path.join(process.cwd(), '.claude', 'statusline.sh')
  const globalPath = path.join(os.homedir(), '.claude', 'statusline.sh')

  const projectExists = fs.existsSync(projectPath)
  const globalExists = fs.existsSync(globalPath)

  if (projectExists && globalExists) {
    return {
      name: 'Statusline File',
      status: 'warn',
      message: 'Both project and global statuslines exist',
      details: `Project: ${projectPath}\nGlobal: ${globalPath}\nProject statusline takes precedence.`
    }
  } else if (projectExists) {
    return {
      name: 'Statusline File',
      status: 'pass',
      message: `Project statusline found: ${projectPath}`
    }
  } else if (globalExists) {
    return {
      name: 'Statusline File',
      status: 'pass',
      message: `Global statusline found: ${globalPath}`
    }
  } else {
    return {
      name: 'Statusline File',
      status: 'fail',
      message: 'No statusline.sh found',
      details: 'Run "cc-statusline init" to generate a statusline'
    }
  }
}

function checkStatuslineConfig(): DiagnosticResult {
  const projectSettingsPath = path.join(process.cwd(), '.claude', 'settings.json')
  const globalSettingsPath = path.join(os.homedir(), '.claude', 'settings.json')

  let settingsPath = ''
  let settings: any = null

  // Check project settings first
  if (fs.existsSync(projectSettingsPath)) {
    settingsPath = projectSettingsPath
    try {
      settings = JSON.parse(fs.readFileSync(projectSettingsPath, 'utf-8'))
    } catch (e) {
      return {
        name: 'Settings Configuration',
        status: 'fail',
        message: 'Failed to parse .claude/settings.json',
        details: `Invalid JSON in: ${projectSettingsPath}`
      }
    }
  } else if (fs.existsSync(globalSettingsPath)) {
    settingsPath = globalSettingsPath
    try {
      settings = JSON.parse(fs.readFileSync(globalSettingsPath, 'utf-8'))
    } catch (e) {
      return {
        name: 'Settings Configuration',
        status: 'fail',
        message: 'Failed to parse ~/.claude/settings.json',
        details: `Invalid JSON in: ${globalSettingsPath}`
      }
    }
  } else {
    return {
      name: 'Settings Configuration',
      status: 'fail',
      message: 'No settings.json found',
      details: 'Claude Code settings not found. Is Claude Code installed?'
    }
  }

  // Check if statusLine is configured
  if (settings.statusLine) {
    if (settings.statusLine.type === 'command' && settings.statusLine.command) {
      return {
        name: 'Settings Configuration',
        status: 'pass',
        message: `Statusline configured: ${settings.statusLine.command}`,
        details: `Settings file: ${settingsPath}`
      }
    } else {
      return {
        name: 'Settings Configuration',
        status: 'warn',
        message: 'statusLine exists but not configured as command',
        details: JSON.stringify(settings.statusLine, null, 2)
      }
    }
  } else {
    return {
      name: 'Settings Configuration',
      status: 'fail',
      message: 'statusLine not configured in settings.json',
      details: 'Run "cc-statusline init" to configure automatically'
    }
  }
}

function checkClaudeSessionFiles(): DiagnosticResult {
  const projectsDir = path.join(os.homedir(), '.claude', 'projects')

  if (!fs.existsSync(projectsDir)) {
    return {
      name: 'Claude Session Files',
      status: 'warn',
      message: 'No Claude projects directory found',
      details: `Expected: ${projectsDir}\nThis is normal if you haven't used Claude Code yet.`
    }
  }

  try {
    const projects = fs.readdirSync(projectsDir)
    const currentDirEncoded = process.cwd().replace(/\//g, '-').replace(/^-/, '')
    const currentProjectDir = path.join(projectsDir, `-${currentDirEncoded}`)

    if (fs.existsSync(currentProjectDir)) {
      const sessionFiles = fs.readdirSync(currentProjectDir).filter(f => f.endsWith('.jsonl'))

      if (sessionFiles.length > 0) {
        return {
          name: 'Claude Session Files',
          status: 'pass',
          message: `Found ${sessionFiles.length} session file(s) for this project`,
          details: `Project dir: ${currentProjectDir}\nLatest: ${sessionFiles[sessionFiles.length - 1]}`
        }
      } else {
        return {
          name: 'Claude Session Files',
          status: 'warn',
          message: 'Project directory exists but no session files',
          details: `Directory: ${currentProjectDir}\nThis is normal for new sessions.`
        }
      }
    } else {
      return {
        name: 'Claude Session Files',
        status: 'info',
        message: 'No session files for this project yet',
        details: `Expected: ${currentProjectDir}\nSession files are created after the first Claude Code interaction.`
      }
    }
  } catch (e) {
    return {
      name: 'Claude Session Files',
      status: 'fail',
      message: 'Failed to read Claude projects directory',
      details: e instanceof Error ? e.message : String(e)
    }
  }
}

function checkLoggingStatus(): DiagnosticResult {
  const projectLogPath = path.join(process.cwd(), '.claude', 'statusline.log')
  const globalLogPath = path.join(os.homedir(), '.claude', 'statusline.log')

  const projectLog = fs.existsSync(projectLogPath)
  const globalLog = fs.existsSync(globalLogPath)

  if (projectLog) {
    const stats = fs.statSync(projectLogPath)
    const age = Date.now() - stats.mtimeMs
    const ageMinutes = Math.floor(age / 60000)

    return {
      name: 'Logging Status',
      status: 'pass',
      message: `Project log exists (last modified ${ageMinutes} minutes ago)`,
      details: `View log: cat ${projectLogPath}`
    }
  } else if (globalLog) {
    const stats = fs.statSync(globalLogPath)
    const age = Date.now() - stats.mtimeMs
    const ageMinutes = Math.floor(age / 60000)

    return {
      name: 'Logging Status',
      status: 'pass',
      message: `Global log exists (last modified ${ageMinutes} minutes ago)`,
      details: `View log: cat ${globalLogPath}`
    }
  } else {
    return {
      name: 'Logging Status',
      status: 'info',
      message: 'No log file found',
      details: 'Logging may be disabled in your statusline configuration, or statusline hasn\'t run yet.'
    }
  }
}

function printResult(result: DiagnosticResult): void {
  const icon = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ '
  }[result.status]

  const color = {
    pass: chalk.green,
    fail: chalk.red,
    warn: chalk.yellow,
    info: chalk.cyan
  }[result.status]

  console.log(`\n${icon} ${chalk.bold(result.name)}`)
  console.log(`   ${color(result.message)}`)

  if (result.details) {
    console.log(chalk.dim(`   ${result.details.split('\n').join('\n   ')}`))
  }
}

export async function diagnoseCommand(): Promise<void> {
  console.log(chalk.cyan.bold('\n🔍 CC-Statusline Diagnostics\n'))
  console.log(chalk.dim('Running diagnostic checks...\n'))

  const results: DiagnosticResult[] = []

  // Run all checks
  results.push(checkJq())
  results.push(checkStatuslineFile())
  results.push(checkStatuslineConfig())
  results.push(checkClaudeSessionFiles())
  results.push(checkLoggingStatus())

  // Print results
  results.forEach(printResult)

  // Summary
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warned = results.filter(r => r.status === 'warn').length

  console.log(chalk.white('\n' + '─'.repeat(60)))
  console.log(chalk.bold('\n📊 Summary:'))
  console.log(`   ${chalk.green('✅ Passed:')} ${passed}/${results.length}`)
  if (failed > 0) console.log(`   ${chalk.red('❌ Failed:')} ${failed}`)
  if (warned > 0) console.log(`   ${chalk.yellow('⚠️  Warnings:')} ${warned}`)

  // Actionable recommendations
  if (failed > 0 || warned > 0) {
    console.log(chalk.cyan.bold('\n💡 Recommendations:\n'))

    const jqFailed = results.find(r => r.name === 'jq Installation' && r.status === 'fail')
    if (jqFailed) {
      console.log(chalk.yellow('   • Install jq to enable context remaining feature'))
      console.log(chalk.dim('     macOS: brew install jq'))
      console.log(chalk.dim('     Linux: sudo apt-get install jq'))
    }

    const noStatusline = results.find(r => r.name === 'Statusline File' && r.status === 'fail')
    if (noStatusline) {
      console.log(chalk.yellow('   • Run "cc-statusline init" to generate statusline'))
    }

    const noConfig = results.find(r => r.name === 'Settings Configuration' && r.status === 'fail')
    if (noConfig) {
      console.log(chalk.yellow('   • Configure Claude Code settings with "cc-statusline init"'))
    }

    const noSession = results.find(r => r.name === 'Claude Session Files' && (r.status === 'warn' || r.status === 'info'))
    if (noSession) {
      console.log(chalk.yellow('   • Session files are created automatically by Claude Code'))
      console.log(chalk.dim('     Context remaining won\'t show until Claude Code runs in this project'))
    }
  } else {
    console.log(chalk.green.bold('\n✨ Everything looks good!\n'))
    console.log(chalk.dim('If you\'re still experiencing issues, check the log file for details.'))
  }

  console.log() // trailing newline
}
