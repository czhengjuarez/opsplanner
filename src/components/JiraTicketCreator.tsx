import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Ticket, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

export function JiraTicketCreator() {
  const [message, setMessage] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createdTicket, setCreatedTicket] = useState<{ key: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jiraProject = "DES";

  const handleCreateTicket = async () => {
    if (!message.trim()) return;
    
    setIsCreating(true);
    setError(null);
    setCreatedTicket(null);
    
    try {
      const response = await fetch('/api/jira/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: jiraProject,
          summary: message.trim(),
          description: message.trim(),
          issueType: 'Task'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      if (data.success && data.ticket) {
        setCreatedTicket({
          key: data.ticket.key,
          url: data.ticket.url
        });
        setMessage(''); // Clear the form on success
      }
    } catch (err) {
      console.error('Error creating Jira ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const isValid = message.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" style={{ color: '#8F1F57' }} />
          Quick Jira Ticket Creator
        </CardTitle>
        <CardDescription>
          Create a Jira ticket quickly without clicking through the JIRA UI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to use:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Enter your ticket description below</li>
            <li>Click "Create Ticket" to directly create a Jira ticket</li>
            <li>The ticket will be created in the {jiraProject} project</li>
          </ol>
        </div>

        {/* Success Message */}
        {createdTicket && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 mb-1">Ticket Created Successfully!</h4>
                <p className="text-sm text-green-800 mb-2">
                  Ticket <strong>{createdTicket.key}</strong> has been created.
                </p>
                <a 
                  href={createdTicket.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 underline"
                >
                  View in Jira <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 mb-1">Error Creating Ticket</h4>
                <p className="text-sm text-red-800">{error}</p>
                <p className="text-xs text-red-700 mt-2">
                  Check the browser console (F12) for more details or verify your Jira credentials are configured correctly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div>
          <label htmlFor="jira-message" className="text-sm font-medium text-gray-700 block mb-2">
            Ticket Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="jira-message"
            placeholder="Describe the issue or task for the Jira ticket..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32"
            disabled={isCreating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be clear and concise. This will be the ticket summary and description.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Button
            onClick={handleCreateTicket}
            disabled={!isValid || isCreating}
            className="w-full"
            style={{ backgroundColor: isValid && !isCreating ? '#8F1F57' : undefined }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Ticket...
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4 mr-2" />
                Create Jira Ticket
              </>
            )}
          </Button>
        </div>

        {/* Project Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <strong>Project:</strong> {jiraProject} (DesignOps)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Issue Type:</strong> Task
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
