import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, X, ClipboardPaste } from 'lucide-react';

export const CheckInModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [tasks, setTasks] = useState([{ title: '' }]);

  const addTask = () => {
    if (tasks.length < 20) {
      setTasks([...tasks, { title: '' }]);
    }
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index].title = value;
    setTasks(newTasks);
  };

  const handleKeyDown = (e, index) => {
    // Enter = Add new task (unless it's the last empty task)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      // Only add if current task is not empty
      if (tasks[index].title.trim() !== '' && tasks.length < 20) {
        addTask();
        // Focus on new task after a short delay
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder^="Task"]');
          if (inputs[index + 1]) {
            inputs[index + 1].focus();
          }
        }, 50);
      }
    }
    
    // Ctrl/Cmd + Enter = Submit form
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = (e, index) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted text contains multiple lines
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 1) {
      e.preventDefault();
      
      // Calculate how many tasks we can add (max 20 total)
      const availableSlots = 20 - tasks.length + 1; // +1 because we replace current
      const tasksToAdd = lines.slice(0, availableSlots);
      
      // Create new tasks array
      const newTasks = [...tasks];
      
      // Replace current task with first line
      newTasks[index].title = tasksToAdd[0];
      
      // Add remaining lines as new tasks
      for (let i = 1; i < tasksToAdd.length; i++) {
        newTasks.splice(index + i, 0, { title: tasksToAdd[i] });
      }
      
      setTasks(newTasks);
      
      // Show info if some tasks were skipped
      if (lines.length > availableSlots) {
        setTimeout(() => {
          alert(`Added ${availableSlots} tasks. ${lines.length - availableSlots} tasks skipped (max 20 tasks allowed).`);
        }, 100);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.title.trim() !== '');
    if (validTasks.length > 0) {
      onSubmit(validTasks);
      setTasks([{ title: '' }]);
    }
  };

  const handleClose = () => {
    setTasks([{ title: '' }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Check In" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">
                Add tasks you plan to work on today
              </p>
            </div>
          </div>

          {/* Paste Helper */}
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ClipboardPaste size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Copy-Paste Multiple Tasks:</strong> Paste from notepad/excel with each task on a new line. 
                They will be automatically split into separate tasks!
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1">
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    placeholder={`Task ${index + 1}`}
                    required={index === 0}
                    autoFocus={index === 0}
                  />
                </div>
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-1"
                    title="Remove task"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {tasks.length < 20 && (
            <button
              type="button"
              onClick={addTask}
              className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Task ({tasks.length}/20)</span>
            </button>
          )}

          {tasks.length >= 20 && (
            <p className="mt-3 text-sm text-orange-600">
              Maximum 20 tasks reached. Remove some tasks to add more.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || tasks.every(t => t.title.trim() === '')}>
            {loading ? 'Checking In...' : 'Check In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
