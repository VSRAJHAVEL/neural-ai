import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Component } from '../lib/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

const ComponentRenderer = ({ component, isSelected, onSelect, onDelete }: { component: Component; isSelected: boolean; onSelect: () => void; onDelete: (e: React.MouseEvent) => void }) => {
  const { type, props } = component;

  const baseClasses = cn(
    "relative group cursor-pointer border-2 transition-all duration-200",
    isSelected ? "border-primary ring-2 ring-primary/20 z-10" : "border-transparent hover:border-primary/50"
  );

  const renderContent = () => {
    switch (type) {
      case 'container':
        return <div className={cn("min-h-[100px] border border-dashed border-gray-700 w-full", props.padding, props.backgroundColor, props.borderRadius)}>Container (Drop items here)</div>;
      case 'text':
        return <p className={cn(props.fontSize, props.color)}>{props.text}</p>;
      case 'button':
        return <button className={cn("px-4 py-2 font-medium transition-colors", props.backgroundColor, props.color, props.borderRadius)}>{props.text}</button>;
      case 'image':
        return <img src={props.src} alt="Component" className={cn("max-w-full h-auto object-cover", props.borderRadius)} />;
      case 'card':
        return (
          <div className={cn("flex flex-col gap-4", props.padding, props.backgroundColor, props.borderRadius, props.shadow)}>
            <div className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-800/50 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-800/50 rounded animate-pulse" />
          </div>
        );
      case 'navbar':
        return (
          <nav className={cn("w-full flex justify-between items-center border-b border-white/10", props.padding, props.backgroundColor)}>
            <span className="font-bold text-lg">Logo</span>
            <div className="flex gap-4">
              <span className="text-sm opacity-70">Home</span>
              <span className="text-sm opacity-70">About</span>
              <span className="text-sm opacity-70">Contact</span>
            </div>
          </nav>
        );
      default:
        return null;
    }
  };

  return (
    <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={baseClasses}>
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-destructive/90 z-50" onClick={onDelete}>
          <Trash2 size={12} />
        </div>
      )}
      {renderContent()}
    </div>
  );
};

export function Canvas() {
  const { layout, selectedComponentId, selectComponent, removeComponent } = useProject();

  return (
    <div 
      className="flex-1 bg-background bg-grid-pattern relative overflow-y-auto p-12 flex justify-center"
      onClick={() => selectComponent(null)}
    >
      <div className="w-full max-w-4xl min-h-[800px] bg-card/50 backdrop-blur-sm shadow-2xl rounded-xl border border-white/5 p-8 space-y-6">
        {layout.components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pointer-events-none">
            <p className="text-lg">Canvas Empty</p>
            <p className="text-sm">Select a component from the sidebar to add it</p>
          </div>
        ) : (
          layout.components.map((comp) => (
            <ComponentRenderer
              key={comp.id}
              component={comp}
              isSelected={selectedComponentId === comp.id}
              onSelect={() => selectComponent(comp.id)}
              onDelete={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
            />
          ))
        )}
      </div>
    </div>
  );
}
