import { Layout } from '../lib/types';
import { Project } from '@shared/schema';

const API_BASE = '/api';

export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
}

export interface GenerationResult {
  files: GeneratedFile[];
  readme: string;
  notes?: string;
}

export async function getAllProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function getProject(id: number): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  return response.json();
}

export async function createProject(name: string, layout: Layout): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, layout }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  
  return response.json();
}

export async function updateProject(id: number, name: string, layout: Layout): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, layout }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  
  return response.json();
}

export async function deleteProject(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
}

export async function generateCode(layout: Layout): Promise<GenerationResult> {
  const response = await fetch(`${API_BASE}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ layout }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate code');
  }
  
  return response.json();
}

export async function optimizeCode(code: string): Promise<{ optimizedCode: string; notes: string }> {
  const response = await fetch(`${API_BASE}/ai/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to optimize code');
  }
  
  return response.json();
}

export async function optimizeLayout(layout: Layout): Promise<{ optimizedLayout: Layout; notes: string }> {
  const response = await fetch(`${API_BASE}/ai/optimize-layout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ layout }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to optimize layout');
  }
  
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  
  return JSON.parse(text);
}
