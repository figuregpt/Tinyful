import { create } from 'zustand';
import { supabase } from '../supabase';
import { Plan, Step, Priority } from '../database.types';
import { GeneratedPlan } from '../eliza';

// Step with plan info for upcoming steps
export interface StepWithPlan extends Step {
  plan_title: string;
  plan_id: string;
}

interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  steps: Step[];
  upcomingSteps: StepWithPlan[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPlans: (userId: string) => Promise<void>;
  fetchPlanWithSteps: (planId: string) => Promise<void>;
  fetchUpcomingSteps: (userId: string) => Promise<void>;
  createPlanFromGenerated: (userId: string, generatedPlan: GeneratedPlan) => Promise<Plan | null>;
  updatePlanStatus: (planId: string, status: Plan['status']) => Promise<void>;
  updatePlanPriority: (planId: string, priority: Priority) => Promise<void>;
  updatePlanOrder: (planId: string, newOrderIndex: number) => Promise<void>;
  reorderPlans: (reorderedPlans: Plan[]) => Promise<void>;
  updateStepStatus: (stepId: string, status: Step['status']) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  clearCurrentPlan: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  currentPlan: null,
  steps: [],
  upcomingSteps: [],
  isLoading: false,
  error: null,

  fetchPlans: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ plans: data || [], isLoading: false });
    } catch (error) {
      console.error('Fetch plans error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUpcomingSteps: async (userId: string) => {
    try {
      // Get all active plans for this user
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('id, title')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (plansError) throw plansError;
      if (!plans || plans.length === 0) {
        set({ upcomingSteps: [] });
        return;
      }

      // For each plan, get only the next incomplete step (first pending/in_progress by order_index)
      const nextStepsPromises = plans.map(async (plan) => {
        const { data: steps, error: stepsError } = await supabase
          .from('steps')
          .select('*')
          .eq('plan_id', plan.id)
          .in('status', ['pending', 'in_progress'])
          .order('order_index', { ascending: true })
          .limit(1);

        if (stepsError || !steps || steps.length === 0) return null;

        return {
          ...steps[0],
          plan_title: plan.title,
        } as StepWithPlan;
      });

      const results = await Promise.all(nextStepsPromises);
      
      // Filter out nulls and sort by due_date
      const stepsWithPlan = results
        .filter((step): step is StepWithPlan => step !== null)
        .sort((a, b) => {
          // Steps with due dates first, then by due date
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });

      set({ upcomingSteps: stepsWithPlan });
    } catch (error) {
      console.error('Fetch upcoming steps error:', error);
    }
  },

  fetchPlanWithSteps: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Fetch steps
      const { data: steps, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('plan_id', planId)
        .order('order_index', { ascending: true });

      if (stepsError) throw stepsError;

      set({ 
        currentPlan: plan, 
        steps: steps || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Fetch plan error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createPlanFromGenerated: async (userId: string, generatedPlan: GeneratedPlan) => {
    set({ isLoading: true, error: null });
    try {
      // Create plan
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

      // Create steps with subSteps stored in notes as JSON
      const stepsData = generatedPlan.steps.map((step, index) => ({
        plan_id: planResult.id,
        title: step.title,
        description: step.description,
        due_date: step.dueDate || null,
        order_index: index,
        status: 'pending',
        notes: JSON.stringify({
          subSteps: step.subSteps || [],
          resources: step.resources || [],
          tips: step.tips || [],
          estimatedDuration: step.estimatedDuration || null,
        }),
      }));

      const { error: stepsError } = await supabase
        .from('steps')
        .insert(stepsData);

      if (stepsError) throw stepsError;

      // Refresh plans list
      await get().fetchPlans(userId);
      
      set({ isLoading: false });
      return planResult;
    } catch (error) {
      console.error('Create plan error:', error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },

  updatePlanStatus: async (planId: string, status: Plan['status']) => {
    try {
      const updateData = { status, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;

      // Update local state
      set(state => ({
        plans: state.plans.map(p => 
          p.id === planId ? { ...p, status } : p
        ),
        currentPlan: state.currentPlan?.id === planId 
          ? { ...state.currentPlan, status } 
          : state.currentPlan,
      }));
    } catch (error) {
      console.error('Update plan status error:', error);
      set({ error: (error as Error).message });
    }
  },

  updatePlanPriority: async (planId: string, priority: Priority) => {
    try {
      const updateData = { priority, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;

      // Update local state
      set(state => ({
        plans: state.plans.map(p => 
          p.id === planId ? { ...p, priority } : p
        ),
        currentPlan: state.currentPlan?.id === planId 
          ? { ...state.currentPlan, priority } 
          : state.currentPlan,
      }));
    } catch (error) {
      console.error('Update plan priority error:', error);
      set({ error: (error as Error).message });
    }
  },

  updatePlanOrder: async (planId: string, newOrderIndex: number) => {
    try {
      const updateData = { order_index: newOrderIndex, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;

      // Update local state
      set(state => ({
        plans: state.plans.map(p => 
          p.id === planId ? { ...p, order_index: newOrderIndex } : p
        ),
      }));
    } catch (error) {
      console.error('Update plan order error:', error);
      set({ error: (error as Error).message });
    }
  },

  reorderPlans: async (reorderedPlans: Plan[]) => {
    // Optimistically update local state
    set({ plans: reorderedPlans });

    // Update all order indices in database
    try {
      const updates = reorderedPlans.map((plan, index) => 
        supabase
          .from('plans')
          .update({ order_index: index })
          .eq('id', plan.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Reorder plans error:', error);
      set({ error: (error as Error).message });
    }
  },

  updateStepStatus: async (stepId: string, status: Step['status']) => {
    try {
      const updateData = { status };
      const { error } = await supabase
        .from('steps')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      // Update local state
      set(state => ({
        steps: state.steps.map(s => 
          s.id === stepId ? { ...s, status } : s
        ),
      }));

      // Check if all steps are completed
      const { steps, currentPlan } = get();
      const allCompleted = steps.every(s => 
        s.id === stepId ? status === 'completed' : s.status === 'completed'
      );

      if (allCompleted && currentPlan) {
        await get().updatePlanStatus(currentPlan.id, 'completed');
      }
    } catch (error) {
      console.error('Update step status error:', error);
      set({ error: (error as Error).message });
    }
  },

  deletePlan: async (planId: string) => {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      set(state => ({
        plans: state.plans.filter(p => p.id !== planId),
        currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
      }));
    } catch (error) {
      console.error('Delete plan error:', error);
      set({ error: (error as Error).message });
    }
  },

  clearCurrentPlan: () => {
    set({ currentPlan: null, steps: [] });
  },
}));
