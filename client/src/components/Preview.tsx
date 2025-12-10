import React from 'react';
import { useProject } from '../context/ProjectContext';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Preview({ onClose }: { onClose: () => void }) {
  const { layout } = useProject();

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
        <span className="font-bold">Preview Mode</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-white text-black p-8">
        {/* Render clean preview without selection wrappers */}
        {layout.components.map((comp) => {
           // Simplified rendering for preview
           switch(comp.type) {
             case 'text': 
                return <p key={comp.id} className={cn(comp.props.fontSize, comp.props.color)}>{comp.props.text}</p>;
             case 'button':
                return <button key={comp.id} className={cn("px-4 py-2", comp.props.backgroundColor, comp.props.color, comp.props.borderRadius)}>{comp.props.text}</button>;
             case 'image':
                return <img key={comp.id} src={comp.props.src} alt="Preview" className={cn("max-w-full", comp.props.borderRadius)} />;
             case 'container':
                return <div key={comp.id} className={cn("min-h-[50px] border border-dashed border-gray-300", comp.props.padding, comp.props.backgroundColor, comp.props.borderRadius)}></div>
             case 'card':
                return <div key={comp.id} className={cn("p-6 shadow-md border", comp.props.backgroundColor, comp.props.borderRadius)}>Card Content</div>
             case 'navbar':
                return <nav key={comp.id} className={cn("flex justify-between p-4 bg-gray-100", comp.props.backgroundColor)}><span>Logo</span><span>Links</span></nav>
             default:
                return null;
           }
        })}
      </div>
    </div>
  );
}
