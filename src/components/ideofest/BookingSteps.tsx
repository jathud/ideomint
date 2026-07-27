'use client';

import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface BookingStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function BookingSteps({ steps, currentStep }: BookingStepsProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, idx) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        const last = idx === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                done
                  ? 'bg-[#c1e527] text-section-ink'
                  : active
                  ? 'bg-[#c1e527] text-section-ink ring-4 ring-[#c1e527]/25 shadow-[0_0_15px_rgba(193,229,39,0.4)] scale-110'
                  : 'bg-white/8 text-white/30 border border-white/12'
              }`}>
                {done ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                active ? 'text-[#c1e527]' : done ? 'text-white/80' : 'text-white/30'
              }`}>
                {step.label}
              </span>
            </div>
            {!last && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${done ? 'bg-[#c1e527]' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
