'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { contactApi } from '@/frontend/lib/api-client';
import Card from '@/frontend/components/ui/Card';
import Button from '@/frontend/components/ui/Button';
import Input from '@/frontend/components/ui/Input';
import Textarea from '@/frontend/components/ui/Textarea';
import { labelClass } from '@/frontend/components/ui/fieldStyles';

const emptyForm = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setError('');
    setSubmitting(true);
    try {
      await contactApi.create(formData);
      setSubmitted(true);
      setFormData(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Have a question for the estate management team? Send us a message and we&apos;ll get back to you.
        </p>

        {submitted ? (
          <Card className="mt-8 animate-fade-in-up text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Message sent</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Thanks for reaching out — the estate management team will get back to you soon.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
              Send another message
            </Button>
          </Card>
        ) : (
          <Card className="mt-8">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Subject</label>
                <Input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Message *</label>
                <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              {error && <div className="text-sm font-medium text-red-500">{error}</div>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
