interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepByStepProps {
  steps: Step[];
  title?: string;
}

export function StepByStep({ steps, title }: StepByStepProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-3xl font-bold text-center mb-6">{title}</h2>
      )}
      
      <div className="space-y-6">
        {steps.map((step) => (
          <div 
            key={step.number} 
            className="flex gap-6 p-6 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-400 transition-colors"
            role="article"
            aria-labelledby={`step-${step.number}-title`}
          >
            {/* Número grande en círculo */}
            <div 
              className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg"
              aria-label={`Paso ${step.number}`}
            >
              {step.number}
            </div>
            
            {/* Icono decorativo */}
            <div className="flex-shrink-0 w-16 h-16 text-blue-600 flex items-center justify-center">
              {step.icon}
            </div>
            
            {/* Contenido */}
            <div className="flex-1">
              <h3 
                id={`step-${step.number}-title`}
                className="text-2xl font-bold mb-2 text-gray-900"
              >
                {step.title}
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
