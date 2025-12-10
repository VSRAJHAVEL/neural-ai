import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export function PropertiesPanel() {
  const { layout, selectedComponentId, updateComponentProps } = useProject();

  const selectedComponent = layout.components.find((c) => c.id === selectedComponentId);

  if (!selectedComponent) {
    return (
      <aside className="w-80 border-l border-sidebar-border bg-sidebar text-sidebar-foreground p-6 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">Select a component on the canvas to edit its properties.</p>
      </aside>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateComponentProps(selectedComponent.id, { [key]: value });
  };

  return (
    <aside className="w-80 border-l border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-sidebar-primary">Properties</h2>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedComponent.type} Component</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Common Props */}
        {(selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Input 
              value={selectedComponent.props.text || ''} 
              onChange={(e) => handleChange('text', e.target.value)}
              className="bg-background border-input"
            />
          </div>
        )}

        {selectedComponent.type === 'image' && (
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input 
              value={selectedComponent.props.src || ''} 
              onChange={(e) => handleChange('src', e.target.value)}
              className="bg-background border-input"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Background Color</Label>
          <Select 
            value={selectedComponent.props.backgroundColor} 
            onValueChange={(val) => handleChange('backgroundColor', val)}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bg-transparent">Transparent</SelectItem>
              <SelectItem value="bg-background">Background</SelectItem>
              <SelectItem value="bg-card">Card</SelectItem>
              <SelectItem value="bg-primary">Primary</SelectItem>
              <SelectItem value="bg-secondary">Secondary</SelectItem>
              <SelectItem value="bg-red-500">Red</SelectItem>
              <SelectItem value="bg-blue-500">Blue</SelectItem>
              <SelectItem value="bg-green-500">Green</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
            <Label>Border Radius</Label>
             <Select 
                value={selectedComponent.props.borderRadius} 
                onValueChange={(val) => handleChange('borderRadius', val)}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded-none">None</SelectItem>
                  <SelectItem value="rounded-sm">Small</SelectItem>
                  <SelectItem value="rounded-md">Medium</SelectItem>
                  <SelectItem value="rounded-lg">Large</SelectItem>
                  <SelectItem value="rounded-full">Full</SelectItem>
                </SelectContent>
              </Select>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
             <Label>Padding</Label>
             <Select 
                value={selectedComponent.props.padding} 
                onValueChange={(val) => handleChange('padding', val)}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select padding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p-0">None</SelectItem>
                  <SelectItem value="p-2">Small</SelectItem>
                  <SelectItem value="p-4">Medium</SelectItem>
                  <SelectItem value="p-6">Large</SelectItem>
                  <SelectItem value="p-8">Extra Large</SelectItem>
                </SelectContent>
              </Select>
        </div>

      </div>
    </aside>
  );
}
