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
  Cpu,
  Copy,
  Check,
  X,
  FileCode
} from 'lucide-react';
import { mockGenerateCode, mockOptimizeCode, GenerationResult } from '../services/mockAi';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function Topbar({ onPreview }: { onPreview: () => void }) {
  const { saveProject, layout } = useProject();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await mockGenerateCode(layout);
      setGeneratedResult(result);
      setActiveFileIndex(0);
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
       // Mock optimization for now just returning a single file structure
      const result = await mockOptimizeCode("<div>Placeholder</div>");
      setGeneratedResult({
         files: [{ name: 'Optimized.jsx', content: result.optimizedJsx, language: 'jsx' }],
         readme: "Optimized Output",
         notes: result.notes 
      });
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

  const copyToClipboard = () => {
    if (generatedResult && generatedResult.files[activeFileIndex]) {
      navigator.clipboard.writeText(generatedResult.files[activeFileIndex].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
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
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 bg-zinc-950 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-white/10 flex flex-row items-center justify-between">
            <div className="space-y-1">
               <DialogTitle className="text-primary flex items-center gap-2">
                  <Cpu size={20} /> AI Generation Result
               </DialogTitle>
               <DialogDescription className="text-zinc-400">
                  {generatedResult?.notes || "Code generation complete."}
               </DialogDescription>
            </div>
            <DialogClose asChild>
               <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <X size={20} />
               </Button>
            </DialogClose>
          </DialogHeader>
          
          <div className="flex-1 flex overflow-hidden">
             {/* File Explorer Sidebar */}
             <div className="w-64 bg-black/50 border-r border-white/10 p-4 overflow-y-auto">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Generated Files</h3>
                <div className="space-y-2">
                   {generatedResult?.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFileIndex(idx)}
                        className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                           activeFileIndex === idx ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                         <FileCode size={14} />
                         {file.name}
                      </button>
                   ))}
                </div>
             </div>

             {/* Code Editor Area */}
             <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#252526]">
                   <span className="text-xs text-zinc-400 font-mono">
                      {generatedResult?.files[activeFileIndex]?.name}
                   </span>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={copyToClipboard}
                     className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-white/10"
                   >
                      {copied ? <Check size={12} className="mr-1.5 text-green-400" /> : <Copy size={12} className="mr-1.5" />}
                      {copied ? 'Copied' : 'Copy Code'}
                   </Button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                   {generatedResult && (
                      <SyntaxHighlighter
                         language={generatedResult.files[activeFileIndex].language === 'jsx' ? 'javascript' : 'css'}
                         style={vscDarkPlus}
                         customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                         showLineNumbers={true}
                      >
                         {generatedResult.files[activeFileIndex].content}
                      </SyntaxHighlighter>
                   )}
                </div>
             </div>
          </div>
          
          <div className="p-4 border-t border-white/10 bg-black flex justify-end gap-2">
             <Button variant="outline" onClick={() => setShowResultDialog(false)} className="border-white/10 text-zinc-300 hover:bg-white/5">
                Close
             </Button>
             <Button onClick={copyToClipboard} className="bg-primary text-black hover:bg-primary/90">
                <Copy size={14} className="mr-2" /> Copy All Files
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
