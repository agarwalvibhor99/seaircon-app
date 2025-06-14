#!/usr/bin/env node

// Test script to check if we can fetch projects from the database
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProjectsFetch() {
  try {
    console.log('Testing simple projects fetch...')
    
    // Test 1: Simple count
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting projects:', countError)
    } else {
      console.log('Total projects in database:', count)
    }
    
    // Test 2: Simple select without joins
    const { data: projects, error: selectError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (selectError) {
      console.error('Error fetching projects:', selectError)
    } else {
      console.log('Sample projects:', projects?.map(p => ({
        id: p.id,
        project_name: p.project_name,
        project_number: p.project_number,
        status: p.status,
        created_at: p.created_at
      })))
    }
    
    // Test 3: Test with joins
    const { data: projectsWithJoins, error: joinError } = await supabase
      .from('projects')
      .select(`
        *,
        customer:customers!projects_customer_id_fkey(id, name, email),
        project_manager:employees!projects_project_manager_id_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (joinError) {
      console.error('Error fetching projects with joins:', joinError)
    } else {
      console.log('Projects with joins:', projectsWithJoins?.map(p => ({
        id: p.id,
        project_name: p.project_name,
        customer: p.customer?.name,
        project_manager: p.project_manager?.full_name
      })))
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testProjectsFetch()
