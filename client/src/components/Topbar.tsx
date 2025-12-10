import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Sparkles, 
  Play, 
  Code,
  Loader2,
  Cpu
} from 'lucide-react';
import { mockGenerateCode, mockOptimizeCode } from '../services/mockAi';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export function Topbar({ onPreview }: { onPreview: () => void }) {
  const { saveProject, layout } = useProject();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{jsx: string, readme: string, notes?: string} | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await mockGenerateCode(layout);
      setGeneratedResult(result);
      setShowResultDialog(true);
      toast({
        title: "Code Generated",
        description: "Your layout has been converted to React code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate code.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await mockOptimizeCode("<div>Placeholder for current layout JSX</div>");
      setGeneratedResult({ jsx: result.optimizedJsx, readme: "Optimized Output", notes: result.notes });
      setShowResultDialog(true);
      toast({
        title: "Optimization Complete",
        description: "AI has improved your code structure.",
      });
    } catch (error) {
      toast({
         title: "Error",
         description: "Failed to optimize code.",
         variant: "destructive"
       });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-primary/20 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3">
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
        </div>
      </header>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-zinc-950 border-primary/20 shadow-2xl shadow-primary/10">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Cpu size={20} /> AI Output
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Generated code from Neural UI Engine.
            </DialogDescription>
          </DialogHeader>
          
          {generatedResult && (
            <div className="space-y-4 mt-4">
              {generatedResult.notes && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/20 p-4 rounded-lg"
                >
                  <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <Sparkles size={16} /> Optimization Notes
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono">{generatedResult.notes}</pre>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label className="text-zinc-300">React JSX</Label>
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                   <pre className="relative p-4 rounded-lg bg-black border border-white/10 overflow-x-auto text-xs font-mono text-green-400 shadow-inner">
                     {generatedResult.jsx}
                   </pre>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">README.md</Label>
                 <pre className="p-4 rounded-lg bg-black border border-white/10 overflow-x-auto text-xs font-mono text-blue-300 shadow-inner">
                   {generatedResult.readme}
                 </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
