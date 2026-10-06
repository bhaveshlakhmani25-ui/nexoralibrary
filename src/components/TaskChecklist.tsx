import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskChecklist: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Read chapter 4', completed: true },
    { id: '2', text: 'Write essay outline', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <h3 style={{ color: 'var(--wood-dark)', marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Group Checklist</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
        {tasks.map(task => (
          <div key={task.id} style={{ 
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: 'rgba(255,255,255,0.6)',
            padding: '12px', borderRadius: '8px'
          }}>
            <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {task.completed ? <CheckCircle2 color="var(--leaf-green)" /> : <Circle color="#999" />}
            </button>
            <span style={{ 
              flex: 1, 
              color: task.completed ? '#888' : 'var(--text-dark)',
              textDecoration: task.completed ? 'line-through' : 'none'
            }}>
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#ff6b6b' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#777', fontSize: '0.9rem' }}>No tasks yet.</p>}
      </div>

      <form onSubmit={addTask} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          style={{
            flex: 1, padding: '10px 12px',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: '8px', outline: 'none',
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}
        />
        <button type="submit" className="btn-3d" style={{ padding: '10px 14px', borderRadius: '8px' }}>
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
};

export default TaskChecklist;
