import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Sparkles, 
  Play, 
  Code,
  Loader2,
  LogOut,
  PanelLeftIcon
} from 'lucide-react';
import { GenerationResult } from '../services/api';
import { generateCode, optimizeLayout, optimizeCode } from '../services/api';
import { toast as sonnerToast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';

export function Topbar({ onPreview, onToggleSidebar, onGenerated }: { onPreview: () => void; onToggleSidebar?: () => void; onGenerated?: (result: GenerationResult) => void }) {
  const { saveProject, layout, setLayout } = useProject();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCode(layout);
      sonnerToast.success("Code Generated", {
        description: "Your layout has been converted to React code using AI.",
      });
      if (onGenerated) onGenerated(result);
    } catch (error) {
      console.error('Generation error:', error);
      sonnerToast.error(error instanceof Error ? error.message : "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!layout || !layout.components || layout.components.length === 0) {
      sonnerToast.info("No layout to optimize", {
        description: "Add components to your layout first.",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeLayout(layout);
      setLayout(result.optimizedLayout);
      sonnerToast.success("Layout Optimized", {
        description: result.notes || "Your layout has been optimized by AI.",
      });
    } catch (error) {
      console.error('Layout optimization error:', error);
      sonnerToast.error(error instanceof Error ? error.message : "Failed to optimize layout");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setLocation('/login');
      sonnerToast.success("Signed out", {
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      sonnerToast.error("Sign out failed", {
        description: error instanceof Error ? error.message : "Failed to sign out",
      });
    }
  };

  return (
    <>
      <header className="h-16 border-b border-primary/20 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-primary hover:bg-primary/10"
              onClick={onToggleSidebar}
            >
              <PanelLeftIcon className="w-4 h-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-600 rounded-lg flex items-center justify-center text-black font-bold font-mono shadow-md shadow-primary/20"
          >
            N
          </motion.div>
          <span className="font-bold text-lg tracking-tight text-white">Neural <span className="text-primary">UI</span></span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={saveProject}
            className="text-white/60 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="text-white/60 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <div className="h-6 w-px bg-white/10 mx-2" />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
            Generate
          </Button>

          <Button 
            size="sm" 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-primary to-yellow-500 hover:from-yellow-400 hover:to-primary text-black font-bold shadow-lg shadow-primary/20 border-none transition-all duration-300 hover:scale-105"
          >
            {isOptimizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Optimize
          </Button>

          <div className="h-6 w-px bg-white/10 mx-2" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* AI result dialog is rendered by the parent (BuilderPage) via `onGenerated` callback */}
    </>
  );
}
