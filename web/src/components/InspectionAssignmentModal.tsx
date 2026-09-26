import React, { useState } from 'react';
import { Institute } from '../types';
import { api } from '../services/api';
import { ShieldAlert, UserCheck, Calendar, AlertCircle, X, Check } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface InspectionAssignmentModalProps {
  institute: Institute;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (inspection: any) => void;
}

export const InspectionAssignmentModal: React.FC<InspectionAssignmentModalProps> = ({
  institute,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inspectorId, setInspectorId] = useState<number>(2); // Default to PMU Team 04 (Officer Rajesh Kumar)
  const [inspectionType, setInspectionType] = useState<string>('SURPRISE');
  const [priority, setPriority] = useState<string>('HIGH');
  const [instructions, setInstructions] = useState<string>(
    'Cross-examine physical attendance register vs reported 94% figure. Conduct random headcount and inspect classroom 2 facilities.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.inspections.assign({
        institute_id: institute.id,
        inspector_id: inspectorId,
        inspection_type: inspectionType,
        priority: priority,
        special_instructions: instructions,
      });
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign inspection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0284c7] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-sm sm:text-base">Recommend Surprise Field Inspection</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Institute Context Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {institute.name}
              </span>
              <RiskBadge score={institute.risk?.score} level={institute.risk?.risk_level} size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">
              Location: {institute.district}, {institute.state} | Scheme: {institute.scheme}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-[#0284c7] dark:text-[#38bdf8] font-semibold">
              Trigger Reasons: Attendance Anomaly (+18%) + Unresolved Compliance + 3 Grievances
            </div>
          </div>

          {/* Assignment Fields */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Assign Inspection Officer / PMU Team
              </label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>Officer Rajesh Kumar — PMU Team 04 (State Central Zone)</option>
                <option value={1}>Director Vikramaditya Sharma — Special Audit Team</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Type
                </label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="SURPRISE">SURPRISE (Unannounced)</option>
                  <option value="COMPLAINT_BASED">COMPLAINT-TRIGGERED</option>
                  <option value="ROUTINE">ROUTINE PERIODIC</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-[#0284c7]"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Targeted Field Instructions
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                placeholder="Specify focus areas for field inspector..."
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Assigning this inspection will automatically generate a <strong>Targeted Checklist</strong> based on the detected anomalies and dispatch an in-app alert to the inspector's mobile workspace.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dispatch Surprise Inspection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
