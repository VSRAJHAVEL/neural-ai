import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ComponentType } from '../lib/types';
import { Box, Type, Image, MousePointerClick, LayoutTemplate, Square } from 'lucide-react';

const COMPONENTS: { type: ComponentType; icon: React.ReactNode; label: string }[] = [
  { type: 'container', icon: <Box size={20} />, label: 'Container' },
  { type: 'text', icon: <Type size={20} />, label: 'Text Block' },
  { type: 'button', icon: <MousePointerClick size={20} />, label: 'Button' },
  { type: 'image', icon: <Image size={20} />, label: 'Image' },
  { type: 'card', icon: <LayoutTemplate size={20} />, label: 'Card' },
  { type: 'navbar', icon: <Square size={20} />, label: 'Navbar' },
];

export function Sidebar() {
  const { addComponent } = useProject();

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-sidebar-primary">Components</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {COMPONENTS.map((item) => (
          <button
            key={item.type}
            onClick={() => addComponent(item.type)}
            className="w-full flex items-center gap-3 p-3 rounded-md bg-sidebar-accent/10 hover:bg-sidebar-accent/30 border border-transparent hover:border-sidebar-primary/50 transition-all group"
          >
            <div className="text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
