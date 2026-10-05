import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Clock, ArrowUpRight, CheckCircle2, AlertCircle, Filter, Zap } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Surveys', 'Apps', 'Social', 'Reviews', 'Other'];

  const fetchTasks = async (category = selectedCategory, search = searchTerm) => {
    try {
      setLoading(true);
      const res = await api.getTasks({ category, search });
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(selectedCategory, searchTerm);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks(selectedCategory, searchTerm);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          Available Tasks
        </h1>
        <p className="text-sm text-surface-muted mt-1">
          Complete verified tasks and surveys to earn direct rewards in your wallet.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by keyword or title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 bg-white"
          />
          <Search className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-surface-border text-surface-muted hover:text-dark hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching active marketplace tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No tasks are currently available."
          description="Try selecting another category or check back shortly for new reward activities."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchTerm('');
            fetchTasks('All', '');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const hasSubmission = Boolean(task.userSubmissionStatus);
            const isApproved = task.userSubmissionStatus === 'approved';
            const isPending = task.userSubmissionStatus === 'pending';
            const isRejected = task.userSubmissionStatus === 'rejected';

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-6 border border-surface-border hover:border-brand-300 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {task.category}
                    </span>

                    {hasSubmission ? (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700'
                            : isPending
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {isApproved ? 'Completed' : isPending ? 'Pending Review' : 'Changes Requested'}
                      </span>
                    ) : (
                      <span className="text-xs text-surface-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>
                    )}
                  </div>

                  {/* Task Title & Description */}
                  <h3 className="text-base font-bold text-dark mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-surface-muted line-clamp-3 leading-relaxed mb-6">
                    {task.description}
                  </p>
                </div>

                {/* Bottom Card Bar: Reward & CTA */}
                <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-surface-muted font-bold">Reward</div>
                    <div className="text-lg font-black text-brand-600">
                      ₦{task.rewardAmount.toFixed(2)}
                    </div>
                  </div>

                  <Link
                    to={`/tasks/${task.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }`}
                  >
                    <span>{isApproved ? 'View Details' : 'View Task'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
