import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been sent to EarnFlow support.', 'success');
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-dark tracking-tight mt-4">
          Contact EarnFlow Support
        </h1>
        <p className="text-base text-surface-muted mt-3">
          Have a question regarding task approvals, withdrawals, or partnerships? We're here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-subtle space-y-6">
            <h3 className="text-lg font-bold text-dark mb-4">Support Channels</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-dark uppercase tracking-wider">Email Address</div>
                <a href="mailto:support@earnflow.ng" className="text-sm font-semibold text-brand-600 hover:underline">
                  support@earnflow.ng
                </a>
                <div className="text-xs text-surface-muted mt-0.5">Average response: under 12 hours</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-dark uppercase tracking-wider">Phone Support</div>
                <div className="text-sm font-semibold text-dark">+234 (0) 800-EARNFLOW</div>
                <div className="text-xs text-surface-muted mt-0.5">Monday to Friday: 9am – 5pm WAT</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-dark uppercase tracking-wider">Operations Hub</div>
                <div className="text-sm text-dark font-medium">Lagos & Abuja, Nigeria</div>
                <div className="text-xs text-surface-muted mt-0.5">Fintech Hub West Africa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Message Received</h3>
              <p className="text-sm text-surface-muted max-w-sm mx-auto mb-6">
                Thank you for contacting EarnFlow. Our support team will review your inquiry and respond to {form.email} shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', subject: '', message: '' });
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-dark mb-2">Send us a message</h3>
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry subject"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows="4"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you today?"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
