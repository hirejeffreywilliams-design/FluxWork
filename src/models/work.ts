export type ISODateTime = string;

export type WorkStatus = 'planned' | 'in_progress' | 'blocked' | 'done';

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  status: WorkStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  dueAt?: ISODateTime;
  tags?: string[];
  ownerId?: string;
}

export function createWorkItem(input: Omit<WorkItem, 'createdAt' | 'updatedAt'> & { createdAt?: ISODateTime; updatedAt?: ISODateTime }): WorkItem {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const updatedAt = input.updatedAt ?? createdAt;
  if (!input.id) throw new Error('WorkItem.id is required');
  if (!input.title) throw new Error('WorkItem.title is required');
  if (!['planned','in_progress','blocked','done'].includes(input.status)) {
    throw new Error('WorkItem.status must be planned|in_progress|blocked|done');
  }
  return { ...input, createdAt, updatedAt };
}

export function transitionStatus(item: WorkItem, next: WorkStatus, at: ISODateTime = new Date().toISOString()): WorkItem {
  const allowed: Record<WorkStatus, WorkStatus[]> = {
    planned: ['in_progress', 'blocked'],
    in_progress: ['blocked', 'done'],
    blocked: ['in_progress'],
    done: [],
  };
  if (!allowed[item.status].includes(next)) {
    throw new Error(`Invalid transition from ${item.status} to ${next}`);
  }
  return { ...item, status: next, updatedAt: at };
}
