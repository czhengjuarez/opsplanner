// src/App.tsx

import { useState, useEffect } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import jsPDF from 'jspdf';

import { Calendar, MessageSquare, Lightbulb, Target, FileText, XCircle, PlusCircle, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

// All interfaces and initial data remain the same...
interface TodoItem { id: number; text: string; completed: boolean; }
interface NoteItem { id: number; text: string; }
interface ProblemBlock { id: number; problemText: string; solutions: [string, string, string]; }
const initialMondayTasks: TodoItem[] = [ { id: 1, text: "Review your design leader's calendar for the week", completed: false }, { id: 2, text: "Identify upcoming decisions where they need input", completed: false }, { id: 3, text: "Prepare brief updates on active initiatives", completed: false }, { id: 4, text: "Note any potential blockers or escalations", completed: false }, ];
const initialCommunicationTasks: TodoItem[] = [ { id: 1, text: "Send bi-weekly DesignOps communication", completed: false }, { id: 2, text: "Flag upcoming decisions that need their input", completed: false }, { id: 3, text: "Share positive feedback received from design teams", completed: false }, { id: 4, text: "Wrap up the week, clean up email inbox", completed: false }, ];
const initialProblemBlock: ProblemBlock[] = [ { id: Date.now(), problemText: "", solutions: ["", "", ""] } ];
const initialWeeklyTasks = { Monday: initialMondayTasks, Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
const initialAdditionalNotes: NoteItem[] = [{id: 1, text: ""}];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const problemSolvingReminders = [ "When bringing up issues, include 2-3 potential solutions", "Frame requests in terms of team/business benefit", "Ask clarifying questions early in projects", "Own mistakes immediately with proposed solutions" ];

export default function App() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  
  // All state management remains the same...
  const [weeklyTasks, setWeeklyTasks] = useLocalStorage<{ [key: string]: TodoItem[] }>('weeklyTasks_v3', initialWeeklyTasks);
  const [newTaskTexts, setNewTaskTexts] = useState<{ [key: string]: string }>({});
  const [problemBlocks, setProblemBlocks] = useLocalStorage<ProblemBlock[]>('problemBlocks_v2', initialProblemBlock);
  const [communicationTodos, setCommunicationTodos] = useLocalStorage<TodoItem[]>('communicationTodos_v1', initialCommunicationTasks);
  const [newCommunicationTaskText, setNewCommunicationTaskText] = useState("");
  const [additionalNotes, setAdditionalNotes] = useLocalStorage<NoteItem[]>('additionalNotes_v1', initialAdditionalNotes);
  const [dailyCheckins, setDailyCheckins] = useLocalStorage<{[key: string]: boolean}>('dailyCheckins_v1', {});
  const [collapsedDays, setCollapsedDays] = useLocalStorage<{[key: string]: boolean}>('collapsedDays_v1', {});
  const [weeklyPriorities, setWeeklyPriorities] = useLocalStorage<string>("weeklyPriorities_v1", "");
  const [weeklyNotes, setWeeklyNotes] = useLocalStorage<string>("weeklyNotes_v1", "");

  useEffect(() => {
    // ... useEffect logic remains the same ...
  }, [weeklyTasks, dailyCheckins, collapsedDays, setDailyCheckins, setCollapsedDays]);

  // --- FINALIZED PDF EXPORT LOGIC ---
  const handleDownloadPDF = () => {
    setIsDownloading(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      let y = 15;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const maxWidth = doc.internal.pageSize.width - margin * 2;

      const addPageIfNeeded = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // UPDATED: Using Helvetica as the standard sans-serif font
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#8F1F57");
      doc.text("Ops Weekly Planner", margin, y);
      y += 15;

      const addSection = (title: string, content: string) => {
          addPageIfNeeded(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor("#000000");
          doc.text(title, margin, y);
          y += 8;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          const splitContent = doc.splitTextToSize(content || "No content entered.", maxWidth);
          addPageIfNeeded(splitContent.length * 5 + 8);
          doc.text(splitContent, margin, y);
          y += splitContent.length * 5 + 8;
      };
      
      addSection("Weekly Priorities", weeklyPriorities);
      addSection("Weekly Notes", weeklyNotes);

      // UPDATED: Add space after the line
      doc.line(margin, y - 4, maxWidth + margin, y - 4);
      y += 5;

      addPageIfNeeded(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Daily Check-in", margin, y); y += 8;
      weekDays.forEach(day => {
          addPageIfNeeded(10);
          doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          const dayStatus = dailyCheckins[day] ? '[x]' : '[ ]';
          doc.text(`${day} ${dayStatus}`, margin, y); y += 6;
          doc.setFont("helvetica", "normal"); doc.setFontSize(11);
          const tasks = weeklyTasks[day] || [];
          if (tasks.length > 0) {
              tasks.forEach(task => {
                  const taskStatus = task.completed ? '[x]' : '[ ]';
                  const taskLines = doc.splitTextToSize(task.text, maxWidth - 10);
                  addPageIfNeeded(taskLines.length * 5 + 2);
                  doc.text(`${taskStatus} ${taskLines[0]}`, margin + 5, y);
                  if (taskLines.length > 1) {
                    doc.text(taskLines.slice(1), margin + 11, y + 5);
                    y += (taskLines.length - 1) * 5;
                  }
                  y += 5;
              });
          } else {
              addPageIfNeeded(5);
              doc.text("No tasks for this day.", margin + 5, y);
              y += 5;
          }
          y += 4;
      });

      doc.line(margin, y - 4, maxWidth + margin, y - 4);
      y += 5;

      addPageIfNeeded(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Problem Solving", margin, y); y += 8;
      problemBlocks.forEach((block, index) => {
          addPageIfNeeded(35);
          doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          doc.text(`Problem / Issue #${index + 1}`, margin, y); y += 6;
          doc.setFont("helvetica", "normal"); doc.setFontSize(11);
          const problemLines = doc.splitTextToSize(block.problemText || "Not described.", maxWidth - 5);
          doc.text(problemLines, margin + 5, y); y += problemLines.length * 5 + 3;
          doc.setFont("helvetica", "bold"); doc.text("Solutions:", margin + 5, y); y += 5;
          doc.setFont("helvetica", "normal");
          block.solutions.forEach((sol, i) => {
              const solLines = doc.splitTextToSize(`${i+1}. ${sol || "Not provided."}`, maxWidth - 10);
              addPageIfNeeded(solLines.length * 5);
              doc.text(solLines, margin + 10, y);
              y += solLines.length * 5;
          });
          y += 5;
      });

      doc.line(margin, y - 4, maxWidth + margin, y - 4);
      y += 5;

      addPageIfNeeded(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Communication", margin, y); y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      communicationTodos.forEach(task => {
          const taskStatus = task.completed ? '[x]' : '[ ]';
          const taskLines = doc.splitTextToSize(task.text, maxWidth - 5);
          addPageIfNeeded(taskLines.length * 5);
          doc.text(`${taskStatus} ${taskLines[0]}`, margin, y);
          if (taskLines.length > 1) {
            doc.text(taskLines.slice(1), margin + 5, y + 5);
            y += (taskLines.length-1) * 5;
          }
          y += 5;
      });
      y += 5;
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("Additional Notes:", margin, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      additionalNotes.forEach(note => {
          if(note.text) {
              const noteLines = doc.splitTextToSize(`- ${note.text}`, maxWidth-5);
              addPageIfNeeded(noteLines.length * 5);
              doc.text(noteLines, margin + 5, y);
              y += noteLines.length * 5;
          }
      });

      doc.save(`weekly-ops-planner-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  // --- ALL OTHER HANDLER FUNCTIONS AND JSX REMAIN THE SAME ---
  const handleReset = () => { if (window.confirm("Are you sure you want to reset the entire planner? All your current data will be lost.")) { setWeeklyTasks(initialWeeklyTasks); setNewTaskTexts({}); setProblemBlocks(initialProblemBlock); setCommunicationTodos(initialCommunicationTasks); setNewCommunicationTaskText(""); setAdditionalNotes(initialAdditionalNotes); setDailyCheckins({}); setCollapsedDays({}); setWeeklyPriorities(""); setWeeklyNotes(""); } };
  const toggleDayCollapse = (day: string) => { setCollapsedDays(prev => ({ ...prev, [day]: !prev[day] })); };
  const handleNewTaskTextChange = (day: string, text: string) => { setNewTaskTexts(prev => ({ ...prev, [day]: text })); };
  const handleAddTask = (day: string) => { const text = newTaskTexts[day] || ""; if (text.trim() === "") return; setWeeklyTasks(prev => ({ ...prev, [day]: [...(prev[day] || []), { id: Date.now(), text, completed: false }] })); setNewTaskTexts(prev => ({ ...prev, [day]: "" })); };
  const handleToggleTask = (day: string, id: number) => { setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo) })); };
  const handleDeleteTask = (day: string, id: number) => { setWeeklyTasks(prev => ({ ...prev, [day]: (prev[day] || []).filter(todo => todo.id !== id) })); };
  const addProblemBlock = () => { setProblemBlocks(prev => [...prev, { id: Date.now(), problemText: "", solutions: ["", "", ""] }]); };
  const deleteProblemBlock = (id: number) => { setProblemBlocks(prev => prev.filter(block => block.id !== id)); };
  const updateProblemText = (id: number, text: string) => { setProblemBlocks(prev => prev.map(block => block.id === id ? { ...block, problemText: text } : block)); };
  const updateSolutionText = (id: number, solutionIndex: number, text: string) => { setProblemBlocks(prev => prev.map(block => { if (block.id === id) { const newSolutions = [...block.solutions] as [string, string, string]; newSolutions[solutionIndex] = text; return { ...block, solutions: newSolutions }; } return block; })); };
  const handleAddCommunicationTodo = () => { if (newCommunicationTaskText.trim() === "") return; setCommunicationTodos(prev => [...prev, { id: Date.now(), text: newCommunicationTaskText, completed: false }]); setNewCommunicationTaskText(""); };
  const handleToggleCommunicationTodo = (id: number) => { setCommunicationTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)); };
  const handleDeleteCommunicationTodo = (id: number) => { setCommunicationTodos(prev => prev.filter(todo => todo.id !== id)); };
  const addAdditionalNote = () => { setAdditionalNotes(prev => [...prev, { id: Date.now(), text: "" }]); };
  const updateAdditionalNote = (id: number, text: string) => { setAdditionalNotes(prev => prev.map(note => note.id === id ? { ...note, text } : note)); };
  const deleteAdditionalNote = (id: number) => { setAdditionalNotes(prev => prev.filter(note => note.id !== id)); };
  const toggleDailyCheckin = (day: string) => { setDailyCheckins(prev => ({ ...prev, [day]: !prev[day] })); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentWeek={currentWeek} 
        setCurrentWeek={setCurrentWeek} 
        onDownloadPDF={handleDownloadPDF}
        isDownloading={isDownloading} 
        onReset={handleReset}
      />
      <main id="planner-content" className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" style={{color: '#8F1F57'}} />Weekly Priorities</CardTitle><CardDescription>Key initiatives and goals for this week</CardDescription></CardHeader><CardContent><Textarea placeholder="List your top 3-5 priorities for the week..." value={weeklyPriorities} onChange={(e) => setWeeklyPriorities(e.target.value)} className="min-h-32"/></CardContent></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" style={{color: '#8F1F57'}} />Weekly Notes</CardTitle><CardDescription>Important context, decisions, or observations</CardDescription></CardHeader><CardContent><Textarea placeholder="Note any important context, upcoming decisions, or observations..." value={weeklyNotes} onChange={(e) => setWeeklyNotes(e.target.value)} className="min-h-32"/></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" style={{color: '#8F1F57'}} />Daily Check-in</CardTitle><CardDescription>Weekly check-in progress</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium">Weekly Progress</span><span className="text-sm text-gray-500">{Object.values(dailyCheckins).filter(Boolean).length}/{weekDays.length} days</span></div>
                  <div className="space-y-4">{weekDays.map((day) => (<div key={day} className="border rounded-lg p-4 space-y-3"><div className="flex items-center"><Checkbox id={`check-${day}`} checked={dailyCheckins[day] || false} onCheckedChange={() => toggleDailyCheckin(day)}/><Label htmlFor={`check-${day}`} className={`text-sm font-medium ml-3 flex-grow ${dailyCheckins[day] ? 'line-through text-gray-500' : 'text-gray-900'}`}>{day}</Label><Button variant="ghost" size="icon" className="h-6 w-6 print-hide" onClick={() => toggleDayCollapse(day)}>{collapsedDays[day] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button></div>{!collapsedDays[day] && (<div className="ml-6 space-y-3 pt-2">{(weeklyTasks[day] || []).map(task => (<div key={task.id} className="flex items-center space-x-2"><Checkbox id={`task-${day}-${task.id}`} checked={task.completed} onCheckedChange={() => handleToggleTask(day, task.id)}/><Label htmlFor={`task-${day}-${task.id}`} className={`text-sm flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</Label><Button variant="ghost" size="icon" className="h-6 w-6 print-hide" onClick={() => handleDeleteTask(day, task.id)}><XCircle className="h-4 w-4 text-gray-400 hover:text-red-500" /></Button></div>))}<div className="flex items-center space-x-2 pt-2 print-hide"><Input placeholder="Add new task..." value={newTaskTexts[day] || ""} onChange={(e) => handleNewTaskTextChange(day, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask(day)}/><Button onClick={() => handleAddTask(day)} size="sm">Add</Button></div></div>)}</div>))}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5" style={{color: '#8F1F57'}} />Problem Solving</CardTitle><CardDescription>Document issues and solutions</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Remember to:</h4>
                    {problemSolvingReminders.map((reminder, index) => (<div key={index} className="flex items-start space-x-2"><div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{backgroundColor: '#8F1F57'}} /><span className="text-xs text-gray-600">{reminder}</span></div>))}
                  </div>
                  {problemBlocks.map((block, index) => (<div key={block.id} className="space-y-4 border-b pb-6"><div className="flex justify-between items-center"><Label htmlFor={`problem-${block.id}`} className="text-sm font-medium text-gray-700">Problem / Issue #{index + 1}</Label>{problemBlocks.length > 1 && (<Button variant="ghost" size="icon" className="h-6 w-6 print-hide" onClick={() => deleteProblemBlock(block.id)}><XCircle className="h-4 w-4 text-gray-400 hover:text-red-500" /></Button>)}</div><Textarea id={`problem-${block.id}`} placeholder="Describe the problem or issue..." value={block.problemText} onChange={(e) => updateProblemText(block.id, e.target.value)} className="mt-1 min-h-20"/><div><Label htmlFor={`solution1-${block.id}`} className="text-sm font-medium text-gray-700">Solution Idea 1</Label><Input id={`solution1-${block.id}`} placeholder="First potential solution..." value={block.solutions[0]} onChange={(e) => updateSolutionText(block.id, 0, e.target.value)} className="mt-1"/></div><div><Label htmlFor={`solution2-${block.id}`} className="text-sm font-medium text-gray-700">Solution Idea 2</Label><Input id={`solution2-${block.id}`} placeholder="Second potential solution..." value={block.solutions[1]} onChange={(e) => updateSolutionText(block.id, 1, e.target.value)} className="mt-1"/></div><div><Label htmlFor={`solution3-${block.id}`} className="text-sm font-medium text-gray-700">Solution Idea 3</Label><Input id={`solution3-${block.id}`} placeholder="Third potential solution..." value={block.solutions[2]} onChange={(e) => updateSolutionText(block.id, 2, e.target.value)} className="mt-1"/></div></div>))}
                  <div className="pt-2 print-hide"><Button variant="outline" onClick={addProblemBlock} className="w-full"><PlusCircle className="h-4 w-4 mr-2" />Add New Problem Block</Button></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" style={{color: '#8F1F57'}} />Communication</CardTitle><CardDescription>Weekly communication practices</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {communicationTodos.map(todo => (<div key={todo.id} className="flex items-center space-x-2"><Checkbox id={`comm-todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => handleToggleCommunicationTodo(todo.id)}/><Label htmlFor={`comm-todo-${todo.id}`} className={`text-sm flex-grow ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{todo.text}</Label><Button variant="ghost" size="icon" className="h-6 w-6 print-hide" onClick={() => handleDeleteCommunicationTodo(todo.id)}><XCircle className="h-4 w-4 text-gray-400 hover:text-red-500" /></Button></div>))}
                    <div className="flex items-center space-x-2 pt-2 print-hide"><Input placeholder="Add new communication task..." value={newCommunicationTaskText} onChange={(e) => setNewCommunicationTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCommunicationTodo()}/><Button onClick={handleAddCommunicationTodo} size="sm">Add</Button></div>
                  </div>
                  <div className="mt-6 space-y-3 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700">Additional Notes:</h4>
                    <div className="space-y-2">{additionalNotes.map((note) => (<div key={note.id} className="flex items-center space-x-2"><Input placeholder="Communication note..." value={note.text} onChange={(e) => updateAdditionalNote(note.id, e.target.value)} className="text-sm flex-grow"/>
                           <Button variant="ghost" size="icon" className="h-6 w-6 print-hide" onClick={() => deleteAdditionalNote(note.id)}>
                            <XCircle className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button></div>))}
                       <Button variant="outline" size="sm" onClick={addAdditionalNote} className="w-full mt-2 print-hide"><PlusCircle className="h-4 w-4 mr-2" />Add Note</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </main>
    </div>
  );
}