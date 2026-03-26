interface MetricWithContextProps {
  value: number | string;
  label: string;
  context: string;
  unit?: string;
  rangeText?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function MetricWithContext({ 
  value, 
  label, 
  context, 
  unit,
  rangeText,
  bgColor = 'white',
  borderColor = '#D1D5DB',
  textColor = '#111827'
}: MetricWithContextProps) {
  return (
    <div 
      className="p-6 rounded-xl border-2"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
      role="region"
      aria-labelledby={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
      aria-describedby={`metric-${label.toLowerCase().replace(/\s+/g, '-')}-desc`}
    >
      {/* Número grande */}
      <div className="text-center mb-4">
        <p 
          className="text-6xl font-bold"
          style={{ color: textColor }}
          aria-label={`${label}: ${value}${unit ? ' ' + unit : ''}`}
        >
          {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
          {unit && <span className="text-4xl text-gray-600 ml-2">{unit}</span>}
        </p>
      </div>
      
      {/* Etiqueta */}
      <h3 
        id={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className="text-2xl font-bold text-center mb-2"
      >
        {label}
      </h3>
      
      {/* Contexto */}
      <p 
        id={`metric-${label.toLowerCase().replace(/\s+/g, '-')}-desc`}
        className="text-xl text-center mb-2"
        style={{ color: textColor }}
      >
        {context}
      </p>
      
      {/* Rango (si aplica) */}
      {rangeText && (
        <p className="text-lg text-center bg-gray-100 p-3 rounded-lg mt-3">
          {rangeText}
        </p>
      )}
    </div>
  );
}
