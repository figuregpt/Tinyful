const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDates() {
  console.log('Fixing dates from 2025 to 2026...\n');

  // First, let's see all plans and their dates
  const { data: allPlans, error: allError } = await supabase
    .from('plans')
    .select('id, title, target_date');
  
  console.log('All plans:', allPlans?.map(p => ({ title: p.title, date: p.target_date })));

  // Fix plan target_dates - get plans with dates in 2025
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('id, title, target_date')
    .gte('target_date', '2025-01-01')
    .lt('target_date', '2026-01-01');

  if (plansError) {
    console.error('Error fetching plans:', plansError);
    return;
  }

  console.log(`Found ${plans?.length || 0} plans with 2025 dates`);

  for (const plan of plans || []) {
    if (plan.target_date) {
      // Add 1 year to the date
      const oldDate = new Date(plan.target_date);
      oldDate.setFullYear(oldDate.getFullYear() + 1);
      const newDate = oldDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('plans')
        .update({ target_date: newDate })
        .eq('id', plan.id);

      if (error) {
        console.error(`Error updating plan ${plan.id}:`, error);
      } else {
        console.log(`✓ Updated plan "${plan.title}": ${plan.target_date} → ${newDate}`);
      }
    }
  }

  // Fix step due_dates - get steps with dates in 2025
  const { data: steps, error: stepsError } = await supabase
    .from('steps')
    .select('id, title, due_date, plan_id')
    .gte('due_date', '2025-01-01')
    .lt('due_date', '2026-01-01');

  if (stepsError) {
    console.error('Error fetching steps:', stepsError);
    return;
  }

  console.log(`\nFound ${steps?.length || 0} steps with 2025 dates`);

  for (const step of steps || []) {
    if (step.due_date) {
      // Add 1 year to the date
      const oldDate = new Date(step.due_date);
      oldDate.setFullYear(oldDate.getFullYear() + 1);
      const newDate = oldDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('steps')
        .update({ due_date: newDate })
        .eq('id', step.id);

      if (error) {
        console.error(`Error updating step ${step.id}:`, error);
      } else {
        console.log(`✓ Updated step "${step.title}": ${step.due_date} → ${newDate}`);
      }
    }
  }

  console.log('\nDone! Refresh your browser to see the updated dates.');
}

fixDates();
