import type { Listener, ReactiveVariable } from './ReactiveVariable';

export const reactivesVariablesList = new Map<any, ReactiveVariable>();
export const globalListenersList = new Set<Listener>();
