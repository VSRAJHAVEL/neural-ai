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
  section: { padding: 'p-8', backgroundColor: 'bg-transparent', borderRadius: 'rounded-none', label: 'Section' },
  footer: { padding: 'p-8', backgroundColor: 'bg-zinc-900', borderRadius: 'rounded-none', label: 'Footer' },
  navbar: { backgroundColor: 'bg-background', padding: 'p-4', label: 'Navbar' },
  card: { padding: 'p-6', backgroundColor: 'bg-card', borderRadius: 'rounded-xl', shadow: 'shadow-md', label: 'Card' },
  text: { text: 'New Text', color: 'text-foreground', fontSize: 'text-base', label: 'Text Block' },
  link: { text: 'Link', color: 'text-primary', fontSize: 'text-sm', href: '#', label: 'Link' },
  button: { text: 'Click Me', backgroundColor: 'bg-primary', color: 'text-primary-foreground', borderRadius: 'rounded-md', label: 'Button' },
  image: { src: 'https://placehold.co/600x400', alt: 'Placeholder', borderRadius: 'rounded-md', label: 'Image' },
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
      let addedToParent = false;
      const tryAddToParent = (comps: Component[]): boolean => {
         for (const comp of comps) {
            if (comp.id === selectedComponentId) {
               // Allow adding children to these types
               if (['container', 'card', 'section', 'footer', 'navbar'].includes(comp.type)) {
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
