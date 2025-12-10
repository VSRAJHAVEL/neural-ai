import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ComponentType } from '../lib/types';
import { Box, Type, Image, MousePointerClick, LayoutTemplate, Square, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <aside className="w-64 border-r border-primary/10 bg-black/95 text-sidebar-foreground flex flex-col h-full backdrop-blur-sm z-40">
      <div className="p-4 border-b border-primary/10">
        <h2 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-primary/80 flex items-center gap-2">
          <GripVertical size={14} /> Components
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {COMPONENTS.map((item, index) => (
          <motion.button
            key={item.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => addComponent(item.type)}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-primary/20 border border-transparent hover:border-primary/50 transition-all group relative overflow-hidden"
          >
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            
            <div className="text-white/60 group-hover:text-primary transition-colors">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
