export type WorkItemId = string;
export type WorkStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface WorkItem {
  id: WorkItemId;
  title: string;
  description?: string;
  status: WorkStatus;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  tags?: string[];
}

export function transition(item: WorkItem, next: WorkStatus): WorkItem {
  const allowed: Record<WorkStatus, WorkStatus[]> = {
    todo: ['in_progress', 'blocked'],
    in_progress: ['blocked', 'done'],
    blocked: ['in_progress'],
    done: [],
  };

  if (!allowed[item.status].includes(next)) {
    throw new Error(`invalid transition: ${item.status} -> ${next}`);
  }

  return { ...item, status: next, updatedAt: new Date().toISOString() };
}
