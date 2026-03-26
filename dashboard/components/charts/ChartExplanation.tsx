'use client';

import React from 'react';

interface ChartExplanationProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ChartExplanation({ title, description, icon }: ChartExplanationProps) {
  return (
    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 text-blue-600 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1">{title}</h4>
          <p className="text-sm text-blue-800 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
