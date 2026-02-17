import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../models/goal.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  public goals$ = this.goalsSubject.asObservable();
  private readonly STORAGE_KEY = 'goals';

  constructor(private storageService: StorageService) {
    this.loadGoals();
  }

  private async loadGoals() {
    const stored = await this.storageService.get(this.STORAGE_KEY);
    if (stored) {
      this.goalsSubject.next(stored);
    }
  }

  async addGoal(goal: Omit<Goal, 'id'>) {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    const current = this.goalsSubject.value;
    const updated = [...current, newGoal];
    await this.updateGoals(updated);
  }

  async updateGoal(goal: Goal) {
    const current = this.goalsSubject.value;
    const index = current.findIndex((g) => g.id === goal.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = goal;
      await this.updateGoals(updated);
    }
  }

  async deleteGoal(id: string) {
    const current = this.goalsSubject.value;
    const updated = current.filter((g) => g.id !== id);
    await this.updateGoals(updated);
  }

  async addContribution(goalId: string, amount: number) {
    const current = this.goalsSubject.value;
    const goal = current.find((g) => g.id === goalId);
    if (goal) {
      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + amount,
      };
      // Check if completed
      if (
        updatedGoal.currentAmount >= updatedGoal.targetAmount &&
        updatedGoal.status === 'active'
      ) {
        updatedGoal.status = 'completed';
      }
      await this.updateGoal(updatedGoal);
    }
  }

  private async updateGoals(goals: Goal[]) {
    await this.storageService.set(this.STORAGE_KEY, goals);
    this.goalsSubject.next(goals);
  }
}
