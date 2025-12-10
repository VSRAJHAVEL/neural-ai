import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Layout, Component, ComponentType } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
  layout: Layout;
  selectedComponentId: string | null;
  addComponent: (type: ComponentType) => void;
  selectComponent: (id: string | null) => void;
  updateComponentProps: (id: string, props: any) => void;
  removeComponent: (id: string) => void;
  saveProject: () => void;
  setLayout: (layout: Layout) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_LAYOUT: Layout = {
  components: [],
};

const DEFAULT_PROPS: Record<ComponentType, any> = {
  container: { padding: 'p-4', backgroundColor: 'bg-transparent', borderRadius: 'rounded-none' },
  text: { text: 'New Text', color: 'text-foreground', fontSize: 'text-base' },
  button: { text: 'Click Me', backgroundColor: 'bg-primary', color: 'text-primary-foreground', borderRadius: 'rounded-md' },
  image: { src: 'https://placehold.co/600x400', alt: 'Placeholder', borderRadius: 'rounded-md' },
  card: { padding: 'p-6', backgroundColor: 'bg-card', borderRadius: 'rounded-xl', shadow: 'shadow-md' },
  navbar: { backgroundColor: 'bg-background', padding: 'p-4' },
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const addComponent = (type: ComponentType) => {
    const newComponent: Component = {
      id: uuidv4(),
      type,
      props: { ...DEFAULT_PROPS[type] },
    };

    setLayout((prev) => ({
      components: [...prev.components, newComponent],
    }));
  };

  const selectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };

  const updateComponentProps = (id: string, newProps: any) => {
    setLayout((prev) => ({
      components: prev.components.map((comp) =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp
      ),
    }));
  };

  const removeComponent = (id: string) => {
    setLayout((prev) => ({
      components: prev.components.filter((comp) => comp.id !== id),
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const saveProject = () => {
    console.log('Project Saved:', JSON.stringify(layout, null, 2));
    // In a real app, this would write to Firestore
    alert('Project saved locally! (Check console for JSON)');
  };

  return (
    <ProjectContext.Provider
      value={{
        layout,
        selectedComponentId,
        addComponent,
        selectComponent,
        updateComponentProps,
        removeComponent,
        saveProject,
        setLayout,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
