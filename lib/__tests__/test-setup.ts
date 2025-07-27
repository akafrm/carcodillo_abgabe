/**
 *Test Setup for Vitest
 */

import { config } from 'dotenv'
import { beforeAll, afterAll } from 'vitest'
import { spawn } from 'child_process'

config({ path: '.env.test' })

// global test config
;(globalThis as any).__TEST_ENV__ = true

let serverProcess: any = null
let serverStarted = false

export async function startTestServer() {
  if (serverStarted) return
  
  return new Promise((resolve, reject) => {
    // Start Next.js in development mode for testing
    serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    })

    let output = ''
    
    serverProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString()
      
      // Wait for server to be ready
      if (output.includes('Ready') || output.includes('localhost:3000')) {
        serverStarted = true
        console.log('Test server ready!')
        setTimeout(resolve, 2000)
      }
    })

    serverProcess.stderr.on('data', (data: Buffer) => {
      console.error('Server error:', data.toString())
    })

    serverProcess.on('error', (error: Error) => {
      reject(error)
    })

    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error('Server startup timeout'))
    }, 30000)
  })
}

export async function stopTestServer() {
  if (serverProcess && serverStarted) {
    console.log('Stopping test server...')
    
    serverProcess.kill('SIGTERM')

    // Wait a bit for shutdown
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL')
    }
    
    serverProcess = null
    serverStarted = false
    console.log('Test server stopped!')
  }
}

// Auto-setup for api tests
const isApiTest = process.argv.some(arg => 
  arg.includes('api-integration') || 
  arg.includes('auth-integration') || 
  arg.includes('performance')
)

if (isApiTest) {
  beforeAll(async () => {
    await startTestServer()
  }, 60000) // 60 second timeout

  afterAll(async () => {
    await stopTestServer()
  })
}
