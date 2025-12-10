import React from 'react';
import { useProject } from '../context/ProjectContext';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Component } from '../lib/types';

// Recursive Preview Renderer
const PreviewRenderer = ({ component }: { component: Component }) => {
  const { type, props, children } = component;

  switch (type) {
    case 'section':
      return (
        <section className={cn("w-full", props.padding, props.backgroundColor, props.borderRadius)}>
          {children?.map(child => <PreviewRenderer key={child.id} component={child} />)}
        </section>
      );
    case 'container':
      return (
        <div className={cn("w-full", props.padding, props.backgroundColor, props.borderRadius)}>
          {children?.map(child => <PreviewRenderer key={child.id} component={child} />)}
        </div>
      );
    case 'footer':
      return (
        <footer className={cn("w-full mt-auto", props.padding, props.backgroundColor, props.borderRadius)}>
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
             {children?.map(child => <PreviewRenderer key={child.id} component={child} />)}
           </div>
        </footer>
      );
    case 'text':
      return <p className={cn(props.fontSize, props.color)}>{props.text}</p>;
    case 'link':
      return <a href={props.href} className={cn(props.fontSize, props.color, "hover:underline")}>{props.text}</a>;
    case 'button':
      return <button className={cn("px-4 py-2 font-medium transition-colors", props.backgroundColor, props.color, props.borderRadius)}>{props.text}</button>;
    case 'image':
      return <img src={props.src} alt="Preview" className={cn("max-w-full h-auto object-cover", props.borderRadius)} />;
    case 'card':
      return (
        <div className={cn("flex flex-col gap-4 shadow-md border", props.padding, props.backgroundColor, props.borderRadius)}>
          {children?.map(child => <PreviewRenderer key={child.id} component={child} />)}
        </div>
      );
    case 'navbar':
      return (
        <nav className={cn("w-full flex justify-between items-center", props.padding, props.backgroundColor)}>
          <span className="font-bold text-lg text-primary">Logo</span>
          <div className="flex gap-4 items-center">
            {children?.map(child => <PreviewRenderer key={child.id} component={child} />)}
          </div>
        </nav>
      );
    default:
      return null;
  }
};

export function Preview({ onClose }: { onClose: () => void }) {
  const { layout } = useProject();

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-300">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card z-10">
        <span className="font-bold">Preview Mode</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-white text-black">
        {/* Render clean preview */}
        {layout.components.map((comp) => (
           <PreviewRenderer key={comp.id} component={comp} />
        ))}
      </div>
    </div>
  );
}
