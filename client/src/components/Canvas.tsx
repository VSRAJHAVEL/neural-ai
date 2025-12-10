import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Component } from '../lib/types';
import { cn } from '@/lib/utils';
import { Trash2, Move } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

// Recursive Renderer
const ComponentRenderer = ({ component, isSelected, onSelect, onDelete }: { component: Component; isSelected: boolean; onSelect: (e: React.MouseEvent) => void; onDelete: (e: React.MouseEvent) => void }) => {
  const { type, props, children } = component;

  // DnD Hooks
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform } = useDraggable({
    id: component.id,
    data: { type: component.type, parentId: component.id } // identifying data
  });

  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: component.id,
    data: { accept: ['container', 'card'].includes(component.type) }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  const baseClasses = cn(
    "relative group cursor-pointer border-2 transition-all duration-200",
    isSelected ? "border-primary ring-2 ring-primary/20 z-10" : "border-transparent hover:border-primary/50"
  );

  const renderContent = () => {
    switch (type) {
      case 'container':
        return (
          <div className={cn("min-h-[100px] border border-dashed border-gray-700 w-full relative", props.padding, props.backgroundColor, props.borderRadius)}>
             <div className="absolute top-0 left-0 bg-white/10 text-[10px] px-1 text-white/50 pointer-events-none uppercase tracking-wider">{props.label || 'Container'}</div>
             <div className="flex flex-col gap-2 pt-4">
                {children && children.map(child => (
                   <ConnectedComponentRenderer key={child.id} component={child} />
                ))}
                {(!children || children.length === 0) && <div className="text-center text-white/20 text-sm py-4">Drop items here</div>}
             </div>
          </div>
        );
      case 'text':
        return <p className={cn(props.fontSize, props.color)}>{props.text}</p>;
      case 'button':
        return <button className={cn("px-4 py-2 font-medium transition-colors", props.backgroundColor, props.color, props.borderRadius)}>{props.text}</button>;
      case 'image':
        return <img src={props.src} alt="Component" className={cn("max-w-full h-auto object-cover", props.borderRadius)} />;
      case 'card':
        return (
          <div className={cn("flex flex-col gap-4 relative", props.padding, props.backgroundColor, props.borderRadius, props.shadow)}>
            <div className="absolute top-0 left-0 bg-white/10 text-[10px] px-1 text-white/50 pointer-events-none uppercase tracking-wider">{props.label || 'Card'}</div>
             <div className="pt-4 flex flex-col gap-2">
                {children && children.map(child => (
                   <ConnectedComponentRenderer key={child.id} component={child} />
                ))}
             </div>
          </div>
        );
      case 'navbar':
        return (
          <nav className={cn("w-full flex justify-between items-center border-b border-white/10", props.padding, props.backgroundColor)}>
            <span className="font-bold text-lg">Logo</span>
            <div className="flex gap-4">
               {children && children.map(child => (
                   <ConnectedComponentRenderer key={child.id} component={child} />
                ))}
            </div>
          </nav>
        );
      default:
        return null;
    }
  };

  // Combine refs
  const setRefs = (node: HTMLElement | null) => {
      setDragNodeRef(node);
      if (['container', 'card'].includes(component.type)) {
         setDropNodeRef(node);
      }
  };

  return (
    <div 
      ref={setRefs} 
      style={style}
      onClick={onSelect} 
      className={baseClasses}
      {...attributes} 
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 flex gap-1 z-50">
           <div className="bg-primary text-black p-1.5 rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:bg-primary/90" {...listeners}>
              <Move size={12} />
           </div>
           <div className="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-destructive/90" onClick={onDelete}>
              <Trash2 size={12} />
           </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

// Wrapper to connect to context (avoids passing props deep down manually)
const ConnectedComponentRenderer = ({ component }: { component: Component }) => {
   const { selectedComponentId, selectComponent, removeComponent } = useProject();
   
   return (
      <ComponentRenderer 
         component={component}
         isSelected={selectedComponentId === component.id}
         onSelect={(e) => { e.stopPropagation(); selectComponent(component.id); }}
         onDelete={(e) => { e.stopPropagation(); removeComponent(component.id); }}
      />
   );
};

export function Canvas() {
  const { layout, selectComponent, removeComponent, addComponent, setLayout } = useProject();

  // Simple drag end handler - In a real app, this would handle reordering and moving between parents
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
       console.log(`Dropped ${active.id} over ${over.id}`);
       // TODO: Implement actual tree moving logic here.
       // For now, this just proves the drag interaction works.
       // Implementing full tree reordering is complex and might break the 'mockup' speed.
       // We rely on "Select Parent -> Add" for nesting for now.
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              <ConnectedComponentRenderer key={comp.id} component={comp} />
            ))
          )}
        </div>
      </div>
    </DndContext>
  );
}
