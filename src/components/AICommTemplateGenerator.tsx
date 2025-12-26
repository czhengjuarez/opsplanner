import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, X, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AICommTemplateGeneratorProps {
  taskText: string;
  onClose: () => void;
}

export function AICommTemplateGenerator({ taskText, onClose }: AICommTemplateGeneratorProps) {
  const [template, setTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [copiedRich, setCopiedRich] = useState(false);
  const [context, setContext] = useState<string>("");
  const [viewMode, setViewMode] = useState<'formatted' | 'markdown'>('formatted');

  const generateTemplate = async () => {
    setIsGenerating(true);
    setError("");
    setTemplate("");

    try {
      const response = await fetch('/api/generate-comm-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskText, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();
      
      if (data.success && data.template) {
        setTemplate(data.template);
      } else {
        setError(data.error || 'Failed to generate template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPlainText = async () => {
    try {
      const plainText = convertMarkdownToPlainText(template);
      await navigator.clipboard.writeText(plainText);
      setCopiedPlain(true);
      setTimeout(() => setCopiedPlain(false), 2000);
    } catch (err) {
      console.error('Failed to copy plain text:', err);
    }
  };

  const copyRichText = async () => {
    try {
      const htmlContent = convertMarkdownToHTML(template);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const plainBlob = new Blob([template], { type: 'text/plain' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': plainBlob,
        }),
      ]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      await navigator.clipboard.writeText(template);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    }
  };

  const convertMarkdownToPlainText = (markdown: string): string => {
    return markdown
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '• ')
      .replace(/^\d+\.\s+/gm, (match) => match);
  };

  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = '<div style="font-family: Arial, sans-serif; line-height: 1.6;"><p>' + html + '</p></div>';
    
    return html;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#8F1F57' }} />
              <CardTitle>AI Communication Template</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Generate a professional communication template for: <strong>{taskText}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Additional Context (Optional)
            </label>
            <Textarea
              placeholder="Add any specific details or context to customize the template..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-20"
            />
          </div>

          {!template && !isGenerating && (
            <Button 
              onClick={generateTemplate} 
              className="w-full"
              style={{ backgroundColor: '#8F1F57' }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Template
            </Button>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#8F1F57' }} />
              <span className="ml-3 text-gray-600">Generating template...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {template && (
            <div className="space-y-3">
              <div className="flex gap-2 mb-2">
                <Button 
                  onClick={() => setViewMode('formatted')} 
                  variant={viewMode === 'formatted' ? 'default' : 'outline'}
                  size="sm"
                  style={viewMode === 'formatted' ? { backgroundColor: '#8F1F57' } : {}}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Formatted
                </Button>
                <Button 
                  onClick={() => setViewMode('markdown')} 
                  variant={viewMode === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  style={viewMode === 'markdown' ? { backgroundColor: '#8F1F57' } : {}}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown
                </Button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {viewMode === 'formatted' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{template}</ReactMarkdown>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-mono">{template}</pre>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={copyPlainText} 
                  className="flex-1"
                  variant={copiedPlain ? "outline" : "default"}
                  style={!copiedPlain ? { backgroundColor: '#8F1F57' } : {}}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedPlain ? 'Copied!' : 'Copy Plain Text'}
                </Button>
                <Button 
                  onClick={copyRichText} 
                  className="flex-1"
                  variant={copiedRich ? "outline" : "default"}
                  style={!copiedRich ? { backgroundColor: '#8F1F57' } : {}}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedRich ? 'Copied!' : 'Copy Rich Text'}
                </Button>
              </div>
              <Button 
                onClick={generateTemplate} 
                variant="outline"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
