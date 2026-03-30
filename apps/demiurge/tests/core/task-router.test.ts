import { describe, it, expect } from 'bun:test';
import { TaskRouter } from '@/core/task-router';
import { TaskPriority } from '@/core/types';

describe('TaskRouter', () => {
  it('should route documentation tasks to tier 1 (cheap)', () => {
    const router = new TaskRouter();
    const tier = router.selectTier('Write documentation for the new API endpoint', TaskPriority.MEDIUM);
    expect(tier).toBe(1);
  });

  it('should route feature implementation to tier 2 (standard)', () => {
    const router = new TaskRouter();
    const tier = router.selectTier('Implement user authentication feature', TaskPriority.HIGH);
    expect(tier).toBe(2);
  });

  it('should route architecture decisions to tier 3 (premium)', () => {
    const router = new TaskRouter();
    const tier = router.selectTier('Design the database schema for the new microservice', TaskPriority.HIGH);
    expect(tier).toBe(3);
  });

  it('should respect critical priority for security tasks', () => {
    const router = new TaskRouter();
    const tier = router.selectTier('Fix security vulnerability in authentication', TaskPriority.CRITICAL);
    expect(tier).toBe(3);
  });

  it('should provide cost estimate', () => {
    const router = new TaskRouter();
    const estimate = router.getCostEstimate(2);
    expect(estimate.tier).toBe(2);
    expect(estimate.provider).toBe('OpenCode Go');
    expect(estimate.relativeCost).toBe('Medium');
  });
});
