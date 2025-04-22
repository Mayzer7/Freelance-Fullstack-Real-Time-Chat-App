import React, { useState, useEffect } from 'react';
import { Code2, Plus, Search, User, Palette, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { TaskModal } from '../components/TaskModal';
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { getTasks } from '../api/posts';
import { useChatStore } from '../store/useChatStore';

const freelancers = [
  {
    id: '1',
    name: 'Анна Смирнова',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    skills: ['UI/UX Design', 'Web Development'],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Михаил Петров',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    skills: ['Mobile Development', 'React Native'],
    rating: 4.9
  },
  {
    id: '3',
    name: 'Елена Козлова',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    skills: ['Graphic Design', 'Branding'],
    rating: 4.7
  }
];

function PostTask() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showThemes, setShowThemes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme, setTheme } = useThemeStore();
  const { setSelectedUser } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    await loadTasks(); // Reload tasks after creating new one
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleWriteMessage = (user) => {
    setSelectedUser(user);
    navigate('/messanger');
  };

  return (
    <div className="min-h-screen bg-base-100 pt-16">
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Theme Selector */}
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="btn btn-circle btn-ghost"
          title="Change theme"
        >
          <Palette className="w-10 h-10" />
        </button>
        {showThemes && (
          <div className="absolute right-0 mt-2 p-4 bg-base-200 rounded-xl shadow-xl w-[280px]">
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  className={`
                    group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                    ${theme === t ? "bg-base-300" : "hover:bg-base-300/50"}
                  `}
                  onClick={() => setTheme(t)}
                >
                  <div className="relative h-6 w-full rounded-md overflow-hidden" data-theme={t}>
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Navigation */}
      <nav className="bg-base-100 border-b border-base-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary rounded-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Новое задание
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Illustration */}
      <section className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Найдите лучших
              <span className="text-primary"> фрилансеров</span>
              {' '}для вашего проекта
            </h1>
            <p className="text-base-content/70 text-lg">
              Разместите задание и получите предложения от профессиональных исполнителей уже сегодня.
            </p>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80"
              alt="Freelancer workspace"
              className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="bg-base-200 p-6 rounded-xl">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск заданий..."
                className="input input-bordered w-full pl-12"
              />
            </div>
            <select className="select select-bordered">
              <option value="">Все категории</option>
              <option value="design">Дизайн</option>
              <option value="development">Разработка</option>
              <option value="marketing">Маркетинг</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error p-4 rounded-lg">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-base-content/70">
            Пока нет доступных заданий
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="bg-base-200 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {task.author.profilePic ? (
                    <img 
                      src={task.author.profilePic}
                      alt={task.author.fullName} 
                      className="w-10 h-10 rounded-full mr-4 object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-base-300 rounded-full mr-4 flex items-center justify-center">
                      {task.author.fullName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <Link to={`/profile/${task.author._id}`} className="hover:text-primary">
                      <span className="font-semibold">{task.author.fullName}</span>
                    </Link>
                    <p className="text-sm text-base-content/70">
                      {formatDate(task.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm rounded-full"
                  onClick={() => handleWriteMessage(task.author)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Написать сообщение
                </button>
              </div>
              <h2 className="text-2xl font-bold mb-6">{task.title}</h2>
              <p className="text-base-content/70 mb-6">{task.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {task.skills.map((skill, index) => (
                    <span key={index} className="bg-primary/20 text-primary px-4 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-right">
                  <span className="text-base-content/70 block">
                    Бюджет: {task.budget.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-base-content/70 block">
                    Дедлайн: {formatDate(task.deadline)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        <h3 className="text-xl font-semibold mb-6">Рекомендуемые исполнители</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {freelancers.map((freelancer) => (
            <div key={freelancer.id} className="bg-base-200 rounded-xl p-6 hover:bg-base-300 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={freelancer.avatar}
                  alt={freelancer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{freelancer.name}</h4>
                  <div className="flex items-center text-warning">
                    <span className="text-sm">★ {freelancer.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-base-300 text-base-content/70 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <button className="btn btn-primary w-full mt-4">
                <User className="w-4 h-4 mr-2" />
                Просмотреть профиль
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PostTask;
