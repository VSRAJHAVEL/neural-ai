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
  container: { padding: 'p-4', backgroundColor: 'bg-transparent', borderRadius: 'rounded-none', label: 'Container' },
  text: { text: 'New Text', color: 'text-foreground', fontSize: 'text-base', label: 'Text Block' },
  button: { text: 'Click Me', backgroundColor: 'bg-primary', color: 'text-primary-foreground', borderRadius: 'rounded-md', label: 'Button' },
  image: { src: 'https://placehold.co/600x400', alt: 'Placeholder', borderRadius: 'rounded-md', label: 'Image' },
  card: { padding: 'p-6', backgroundColor: 'bg-card', borderRadius: 'rounded-xl', shadow: 'shadow-md', label: 'Card' },
  navbar: { backgroundColor: 'bg-background', padding: 'p-4', label: 'Navbar' },
};

// Helper to find and update a component in the tree
const updateComponentInTree = (components: Component[], id: string, updater: (comp: Component) => Component): Component[] => {
  return components.map((comp) => {
    if (comp.id === id) {
      return updater(comp);
    }
    if (comp.children) {
      return { ...comp, children: updateComponentInTree(comp.children, id, updater) };
    }
    return comp;
  });
};

// Helper to remove a component from the tree
const removeComponentFromTree = (components: Component[], id: string): Component[] => {
  return components
    .filter((comp) => comp.id !== id)
    .map((comp) => ({
      ...comp,
      children: comp.children ? removeComponentFromTree(comp.children, id) : undefined,
    }));
};

// Helper to add a child to a specific parent
const addChildToParent = (components: Component[], parentId: string, newComponent: Component): Component[] => {
  return components.map((comp) => {
    if (comp.id === parentId) {
      return { ...comp, children: [...(comp.children || []), newComponent] };
    }
    if (comp.children) {
      return { ...comp, children: addChildToParent(comp.children, parentId, newComponent) };
    }
    return comp;
  });
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const addComponent = (type: ComponentType) => {
    const newComponent: Component = {
      id: uuidv4(),
      type,
      props: { ...DEFAULT_PROPS[type] },
      children: [],
    };

    if (selectedComponentId) {
      // Check if selected component is a container (or card) that can accept children
      // We need to find the component first to check its type, but for simplicity, 
      // let's try to add it. If the selected component shouldn't have children, 
      // we might need a stricter check. For now, 'container' and 'card' are good candidates.
      // But to keep it simple: if selected, try to add as child.
      
      // We need to know if the target is a container.
      // Let's assume ONLY 'container' and 'card' can have children for now.
      // But since we don't have the component object handy here without searching...
      // Let's just add to root if not a container, or maybe the user wants to add as a sibling?
      // Standard UX: If container selected -> Add inside. Else -> Add to root.
      
      // Let's implement: Always add to root unless we find the selected ID and it is a container.
      // Actually, let's just add to root for now to ensure it works, then improve.
      // WAIT, user specifically asked "drag components inside another".
      // So I will implement "Add to Selected Parent" logic.
      
      let addedToParent = false;
      const tryAddToParent = (comps: Component[]): boolean => {
         for (const comp of comps) {
            if (comp.id === selectedComponentId) {
               if (comp.type === 'container' || comp.type === 'card') {
                  return true;
               }
            }
            if (comp.children && tryAddToParent(comp.children)) return true;
         }
         return false;
      };

      if (tryAddToParent(layout.components)) {
         setLayout((prev) => ({
            components: addChildToParent(prev.components, selectedComponentId, newComponent)
         }));
         return;
      }
    }

    // Default: Add to root
    setLayout((prev) => ({
      components: [...prev.components, newComponent],
    }));
  };

  const selectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };

  const updateComponentProps = (id: string, newProps: any) => {
    setLayout((prev) => ({
      components: updateComponentInTree(prev.components, id, (comp) => ({
        ...comp,
        props: { ...comp.props, ...newProps },
      })),
    }));
  };

  const removeComponent = (id: string) => {
    setLayout((prev) => ({
      components: removeComponentFromTree(prev.components, id),
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const saveProject = () => {
    console.log('Project Saved:', JSON.stringify(layout, null, 2));
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
