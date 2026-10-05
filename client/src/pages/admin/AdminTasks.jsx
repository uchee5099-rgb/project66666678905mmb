import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, CheckSquare, Clock, Power, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

export default function AdminTasks() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const initialForm = {
    title: '',
    category: 'Surveys',
    rewardAmount: '',
    estimatedMinutes: 5,
    description: '',
    instructions: '',
    requirements: '',
    proofType: 'text',
    maxParticipants: 1000,
    status: 'active'
  };

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      category: task.category,
      rewardAmount: task.rewardAmount,
      estimatedMinutes: task.estimatedMinutes,
      description: task.description,
      instructions: task.instructions,
      requirements: task.requirements,
      proofType: task.proofType,
      maxParticipants: task.maxParticipants || 1000,
      status: task.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingTask) {
        await api.updateAdminTask(editingTask.id, form);
        showToast('Task updated successfully.', 'success');
      } else {
        await api.createAdminTask(form);
        showToast('New task published to marketplace.', 'success');
      }
      setModalOpen(false);
      await fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to save task.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    try {
      await api.deleteAdminTask(task.id);
      showToast('Task deleted successfully.', 'success');
      await fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Task Management
          </h1>
          <p className="text-sm text-surface-muted mt-1">
            Create, update, and manage task reward campaigns on EarnFlow.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle">
        {loading ? (
          <LoadingSpinner text="Loading marketplace tasks..." />
        ) : tasks.length === 0 ? (
          <p className="text-sm text-surface-muted text-center py-10">No tasks created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase font-bold text-surface-muted tracking-wider">
                  <th className="pb-3 px-3">Title & Category</th>
                  <th className="pb-3 px-3 text-right">Reward</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-3 max-w-sm">
                      <div className="font-bold text-dark">{task.title}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {task.category}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right font-black text-brand-600 whitespace-nowrap">
                      ₦{task.rewardAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-3 text-xs text-surface-muted whitespace-nowrap">
                      {task.estimatedMinutes} mins
                    </td>
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          task.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 rounded-lg text-surface-muted hover:text-dark hover:bg-slate-100"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="p-1.5 rounded-lg text-surface-muted hover:text-red-600 hover:bg-red-50"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task Campaign' : 'Create New Reward Task'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Complete Fintech Survey"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
              >
                <option value="Surveys">Surveys</option>
                <option value="Apps">Apps</option>
                <option value="Social">Social</option>
                <option value="Reviews">Reviews</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Reward (₦)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.rewardAmount}
                onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })}
                placeholder="250.00"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Minutes
              </label>
              <input
                type="number"
                required
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
                placeholder="5"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Short Description
            </label>
            <textarea
              rows="2"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Step-by-step Instructions
            </label>
            <textarea
              rows="4"
              required
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="1. Open survey link...&#10;2. Answer questions..."
              className="w-full p-3 rounded-xl border border-surface-border text-sm font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Requirements
            </label>
            <input
              type="text"
              required
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Proof Type
              </label>
              <select
                value={form.proofType}
                onChange={(e) => setForm({ ...form, proofType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
              >
                <option value="text">Text / Code Token</option>
                <option value="screenshot">Screenshot Link</option>
                <option value="text_or_screenshot">Text or Screenshot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
            >
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
