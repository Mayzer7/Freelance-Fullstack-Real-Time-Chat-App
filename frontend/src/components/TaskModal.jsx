import React, { useState } from 'react';
import { X } from 'lucide-react';

export function TaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    deadline: '',
    skills: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
              onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
              placeholder="Например: React, TypeScript, Node.js"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Опубликовать задание
          </button>
        </form>
      </div>
    </div>
  );
}
