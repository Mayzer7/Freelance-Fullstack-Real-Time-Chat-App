import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createTask } from '../api/posts';

export function TaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    deadline: '',
    skills: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await createTask(formData);
      onSubmit(response);
      setFormData({
        title: '',
        description: '',
        budget: 0,
        deadline: '',
        skills: [],
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task. Please try again.');
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-300/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-xl p-6 w-full max-w-2xl relative border border-base-200 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-base-content/70 hover:text-base-content transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-base-content mb-6">Новое задание</h2>
        
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
              Название задания
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название задания"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
              Описание
            </label>
            <textarea
              required
              className="textarea textarea-bordered w-full min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите ваше задание подробно"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
              Бюджет (₽)
            </label>
            <input
              type="number"
              required
              min="0"
              className="input input-bordered w-full"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              placeholder="Укажите бюджет"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
              Срок выполнения
            </label>
            <input
              type="date"
              required
              className="input input-bordered w-full"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
              Требуемые навыки (через запятую)
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.skills.join(', ')}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="Например: React, TypeScript, Node.js"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Публикация...' : 'Опубликовать задание'}
          </button>
        </form>
      </div>
    </div>
  );
}
