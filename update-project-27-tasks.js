#!/usr/bin/env node

/**
 * Update Project #27 Tasks - Mark Step 1 Preparation as Done
 * 
 * Updates the tasks for Project #27 (Production Deployment & Stabilization)
 * to mark the preparation work for Step 1 as complete.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001'
const API_TOKEN = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6Ik1DUCIsImlhdCI6MTc3NzI0ODM1OCwiZXhwIjoxODA4Nzg0MzU4fQ.Wmym8ZoxeqD0B8o6xHGKNr2X6vvAGwSQVIEDpvHTaJY'

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`API Error: ${data.error || res.statusText}`)
  }
  return data
}

async function main() {
  console.log('📝 Updating Project #27 Tasks...\n')
  console.log('Project: Production Deployment & Stabilization')
  console.log('Task: 1 - Launch Pitch Passport to Production\n')

  try {
    // Get all tasks for project 27
    const tasks = await api(`/pt/tasks?project_id=27`)
    
    console.log(`Found ${tasks.length} tasks in Project #27\n`)

    // Find the first task (Launch Pitch Passport to Production)
    const launchTask = tasks.find(t => t.title.includes('Launch Pitch Passport'))
    
    if (!launchTask) {
      console.error('❌ Could not find "Launch Pitch Passport" task')
      return
    }

    console.log(`📋 Task Found: ${launchTask.title}`)
    console.log(`   Current Status: ${launchTask.status}`)
    console.log(`   Current Hours: Est ${launchTask.est_hours}h, Actual ${launchTask.actual_hours}h\n`)

    // Update task status to "In Progress" and add actual hours
    console.log('⏳ Updating task status to "In Progress"...\n')
    
    const updated = await api(`/pt/tasks/${launchTask.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        project_id: 27,
        title: launchTask.title,
        description: launchTask.description,
        plan: launchTask.plan,
        done: 'Preparation complete: Created deployment documentation, verified builds, prepared environment configs. Ready for deployment execution.',
        type: launchTask.type,
        status: 'In Progress',
        priority: launchTask.priority,
        shirt_size: launchTask.shirt_size,
        assignee: launchTask.assignee,
        est_hours: launchTask.est_hours,
        actual_hours: 1, // 1 hour for preparation
      }),
    })

    console.log('✅ Task Updated Successfully!')
    console.log(`   New Status: In Progress`)
    console.log(`   Actual Hours: 1 (preparation)\n`)

    // Get updated task to verify
    const updatedTask = await api(`/pt/tasks/${launchTask.id}`)
    console.log('📊 Updated Task Details:')
    console.log(`   Title: ${updatedTask.title}`)
    console.log(`   Status: ${updatedTask.status}`)
    console.log(`   Est Hours: ${updatedTask.est_hours}`)
    console.log(`   Actual Hours: ${updatedTask.actual_hours}`)
    console.log(`   Done Notes: ${updatedTask.done}\n`)

    console.log('🎉 Project #27 Task 1 Updated!')
    console.log('\n📱 View in Denick: http://localhost:5174/projects/27\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main().catch(console.error)
