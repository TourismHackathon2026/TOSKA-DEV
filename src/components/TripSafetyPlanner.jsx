import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Clipboard, PhoneCall, Share2, ShieldCheck, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'trailguard:safety-plan';
const DEFAULT_CHECKLIST = [
  { id: 'route', label: 'Shared my route with a trusted contact', done: false },
  { id: 'maps', label: 'Downloaded offline maps and waypoints', done: false },
  { id: 'battery', label: 'Packed a power bank and charging cable', done: false },
  { id: 'weather', label: 'Checked weather and avalanche advisories', done: false },
  { id: 'checkin', label: 'Set a check-in time for the day', done: false },
];

export default function TripSafetyPlanner() {
  const [plan, setPlan] = useState({
    route: '',
    startDate: '',
    returnDate: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  });
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.plan) setPlan(parsed.plan);
      if (Array.isArray(parsed?.checklist)) setChecklist(parsed.checklist);
    } catch (error) {
      console.warn('Unable to restore trip safety plan:', error.message);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, checklist }));
    } catch (error) {
      console.warn('Unable to save trip safety plan:', error.message);
    }
  }, [plan, checklist]);

  const completion = useMemo(() => {
    const doneCount = checklist.filter((item) => item.done).length;
    return Math.round((doneCount / checklist.length) * 100);
  }, [checklist]);

  const toggleChecklistItem = (id) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const handlePlanChange = (field, value) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setStatus('Trip plan saved locally and ready for your next trek.');
  };

  const handleShare = async () => {
    const summary = [
      `TrailGuard safety summary`,
      `Route: ${plan.route || 'Not set'}`,
      `Departure: ${plan.startDate || 'Not set'}`,
      `Return: ${plan.returnDate || 'Not set'}`,
      `Emergency contact: ${plan.contactName || 'Not set'} • ${plan.contactPhone || 'Not set'}`,
      `Notes: ${plan.notes || 'No extra notes'}`,
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'TrailGuard trip plan', text: summary });
        setStatus('Trip plan shared successfully.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setStatus('Trip plan copied to clipboard.');
      } else {
        setStatus('Sharing is unavailable in this browser.');
      }
    } catch (error) {
      console.warn('Unable to share plan:', error.message);
      setStatus('Sharing was canceled.');
    }
  };

  const resetPlan = () => {
    setPlan({ route: '', startDate: '', returnDate: '', contactName: '', contactPhone: '', notes: '' });
    setChecklist(DEFAULT_CHECKLIST);
    setStatus('Trip plan cleared.');
  };

  return (
    <div className="rounded-[32px] border border-[#DDEBE2] bg-[#FBFDFB] p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-2xl bg-[#E5F5EE] p-2 text-[#00965E]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00965E]">Trip readiness</p>
          </div>
          <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>Safety planner & emergency checklist</h3>
          <p className="mt-1 text-sm text-slate-500">Capture your route, emergency contact, and essential prep steps before you head out.</p>
        </div>
        <div className="rounded-3xl border border-[#C2EAD9] bg-[#F0FBF6] px-4 py-3 text-sm font-semibold text-[#005A3C]">
          {completion}% ready
        </div>
      </div>

      {status && (
        <div className="mb-5 rounded-2xl border border-[#C2EAD9] bg-[#E5F5EE] px-4 py-3 text-sm text-[#005A3C]">
          {status}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Route / trek</span>
              <input
                value={plan.route}
                onChange={(event) => handlePlanChange('route', event.target.value)}
                placeholder="Everest Base Camp"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Departure</span>
              <input
                type="date"
                value={plan.startDate}
                onChange={(event) => handlePlanChange('startDate', event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Expected return</span>
              <input
                type="date"
                value={plan.returnDate}
                onChange={(event) => handlePlanChange('returnDate', event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Emergency contact</span>
              <input
                value={plan.contactName}
                onChange={(event) => handlePlanChange('contactName', event.target.value)}
                placeholder="Asha Rai"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Emergency phone</span>
            <div className="mt-2 flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus-within:border-[#00965E]">
              <PhoneCall className="h-4 w-4 text-slate-400" />
              <input
                value={plan.contactPhone}
                onChange={(event) => handlePlanChange('contactPhone', event.target.value)}
                placeholder="+977 98XXXXXXXX"
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</span>
            <textarea
              value={plan.notes}
              onChange={(event) => handlePlanChange('notes', event.target.value)}
              rows={3}
              placeholder="Extra gear, altitude concerns, or buddy details"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00965E] resize-none"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-3xl bg-[#00965E] px-4 py-2 text-sm font-semibold text-white">
              <CheckCircle2 className="h-4 w-4" /> Save plan
            </button>
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <Share2 className="h-4 w-4" /> Share summary
            </button>
            <button type="button" onClick={resetPlan} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <Trash2 className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <BookOpen className="h-4 w-4 text-[#00965E]" />
            Essential checklist
          </div>
          <div className="space-y-3">
            {checklist.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00965E] focus:ring-[#00965E]"
                />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
