import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Plus, X } from 'lucide-react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.title.trim() !== '');
    if (validTasks.length > 0) {
      onSubmit(validTasks);
      setTasks([{ title: '' }]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check In" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Add tasks you plan to work on today (minimum 1, maximum 20)
          </p>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(index, e.target.value)}
                    placeholder={`Task ${index + 1}`}
                    required
                  />
                </div>
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
              className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Checking In...' : 'Check In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
