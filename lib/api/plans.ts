import { supabase } from '../supabase';
import { Plan, Step } from '../database.types';
import { GeneratedPlan } from '../eliza';

export async function getUserPlans(userId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPlanSteps(planId: string): Promise<Step[]> {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createPlan(
  userId: string,
  generatedPlan: GeneratedPlan
): Promise<Plan> {
  // Create the plan
  const planData = {
    user_id: userId,
    title: generatedPlan.title,
    description: generatedPlan.description,
    target_date: generatedPlan.targetDate || null,
    status: 'active',
  };

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert(planData)
    .select()
    .single();

  if (planError) throw planError;
  
  const planResult = plan as Plan;

  // Create the steps
  const stepsData = generatedPlan.steps.map((step, index) => ({
    plan_id: planResult.id,
    title: step.title,
    description: step.description,
    due_date: step.dueDate || null,
    order_index: index,
    status: 'pending',
  }));

  const { error: stepsError } = await supabase.from('steps').insert(stepsData);

  if (stepsError) throw stepsError;

  return planResult;
}

export async function updatePlanStatus(
  planId: string,
  status: Plan['status']
): Promise<void> {
  const updateData = { status, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from('plans')
    .update(updateData)
    .eq('id', planId);

  if (error) throw error;
}

export async function updateStepStatus(
  stepId: string,
  status: Step['status']
): Promise<void> {
  const updateData = { status };
  const { error } = await supabase
    .from('steps')
    .update(updateData)
    .eq('id', stepId);

  if (error) throw error;
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId);

  if (error) throw error;
}

export async function getPlansWithStepCounts(userId: string): Promise<
  Array<Plan & { completedSteps: number; totalSteps: number }>
> {
  const plans = await getUserPlans(userId);

  const plansWithCounts = await Promise.all(
    plans.map(async (plan) => {
      const steps = await getPlanSteps(plan.id);
      const completedSteps = steps.filter((s) => s.status === 'completed').length;
      return {
        ...plan,
        completedSteps,
        totalSteps: steps.length,
      };
    })
  );

  return plansWithCounts;
}
