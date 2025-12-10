import React, { useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings2, Layers, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PropertiesPanel() {
  const { layout, selectedComponentId, updateComponentProps } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to find selected component in tree
  const findComponent = (components: any[], id: string): any => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = selectedComponentId ? findComponent(layout.components, selectedComponentId) : null;

  if (!selectedComponent) {
    return (
      <aside className="w-80 border-l border-primary/10 bg-black/95 text-sidebar-foreground p-6 flex flex-col items-center justify-center text-center z-40">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
          <Layers size={32} />
        </div>
        <p className="text-white/40 text-sm">Select a component on the canvas to edit its properties.</p>
      </aside>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateComponentProps(selectedComponent.id, { [key]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChange('src', event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 border-l border-primary/10 bg-black/95 text-sidebar-foreground flex flex-col h-full overflow-y-auto z-40">
      <div className="p-4 border-b border-primary/10">
        <h2 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-primary/80 flex items-center gap-2">
          <Settings2 size={14} /> Properties
        </h2>
        <p className="text-xs text-white/40 mt-1 capitalize pl-6">{selectedComponent.type} Component</p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div 
          key={selectedComponent.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 space-y-6"
        >
          {/* Label Edit */}
          <div className="space-y-2">
            <Label className="text-white/80">Component Label (Internal)</Label>
            <Input 
              value={selectedComponent.props.label || ''} 
              onChange={(e) => handleChange('label', e.target.value)}
              className="bg-white/5 border-white/10 text-white focus:border-primary/50"
              placeholder="e.g. Hero Section"
            />
          </div>

          <Separator className="bg-white/10" />

          {/* Text Content */}
          {(selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
            <div className="space-y-2">
              <Label className="text-white/80">Text Content</Label>
              <Input 
                value={selectedComponent.props.text || ''} 
                onChange={(e) => handleChange('text', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-primary/50"
              />
            </div>
          )}

          {/* Image Upload */}
          {selectedComponent.type === 'image' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Image Source</Label>
                <div className="flex gap-2">
                  <Input 
                    value={selectedComponent.props.src || ''} 
                    onChange={(e) => handleChange('src', e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80">Or Upload Local Image</Label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-md border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all text-sm text-white/60"
                >
                  <Upload size={16} /> Choose from Device
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white/80">Background Color</Label>
            <Select 
              value={selectedComponent.props.backgroundColor} 
              onValueChange={(val) => handleChange('backgroundColor', val)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="bg-transparent">Transparent</SelectItem>
                <SelectItem value="bg-background">Black (Bg)</SelectItem>
                <SelectItem value="bg-card">Dark Grey (Card)</SelectItem>
                <SelectItem value="bg-primary">Gold (Primary)</SelectItem>
                <SelectItem value="bg-secondary">Grey (Secondary)</SelectItem>
                <SelectItem value="bg-red-900">Dark Red</SelectItem>
                <SelectItem value="bg-blue-900">Dark Blue</SelectItem>
                <SelectItem value="bg-emerald-900">Dark Emerald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
              <Label className="text-white/80">Border Radius</Label>
               <Select 
                  value={selectedComponent.props.borderRadius} 
                  onValueChange={(val) => handleChange('borderRadius', val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="rounded-none">None</SelectItem>
                    <SelectItem value="rounded-sm">Small</SelectItem>
                    <SelectItem value="rounded-md">Medium</SelectItem>
                    <SelectItem value="rounded-lg">Large</SelectItem>
                    <SelectItem value="rounded-full">Full</SelectItem>
                  </SelectContent>
                </Select>
          </div>
          
          <Separator className="my-4 bg-white/10" />
          
          <div className="space-y-2">
               <Label className="text-white/80">Padding</Label>
               <Select 
                  value={selectedComponent.props.padding} 
                  onValueChange={(val) => handleChange('padding', val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20">
                    <SelectValue placeholder="Select padding" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="p-0">None</SelectItem>
                    <SelectItem value="p-2">Small</SelectItem>
                    <SelectItem value="p-4">Medium</SelectItem>
                    <SelectItem value="p-6">Large</SelectItem>
                    <SelectItem value="p-8">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
          </div>

        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
