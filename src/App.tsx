import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface Task {
  title: string;
  completed: boolean;
  created_at: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => setTasks([]));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    })
      .then(() => {
        setNewTask('');
        fetchTasks();
      })
      .catch(() => {});
  };

  const toggleTask = (index: number) => {
    fetch(`/api/tasks/${index}/complete`, { method: 'POST' })
      .then(fetchTasks)
      .catch(() => {});
  };

  const deleteTask = (index: number) => {
    fetch(`/api/tasks/${index}`, { method: 'DELETE' })
      .then(fetchTasks)
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Todo List</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </form>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 group"
            >
              <button
                onClick={() => toggleTask(index)}
                className="text-gray-400 hover:text-purple-600 focus:outline-none"
              >
                {task.completed ? (
                  <CheckCircle2 className="text-purple-600" />
                ) : (
                  <Circle />
                )}
              </button>
              
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </span>
              
              <span className="text-sm text-gray-400">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
              
              <button
                onClick={() => deleteTask(index)}
                className="text-gray-400 hover:text-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tasks yet. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;