'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SleepDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function SleepDetailModal({ isOpen, onClose, data }: SleepDetailModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Detalle de Sueño - {format(new Date(data.calendar_date), 'dd MMMM yyyy', { locale: es })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Calidad</p>
              <p className="text-2xl font-bold">{data.sleep_score}/100</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas Totales</p>
              <p className="text-2xl font-bold">{data.total_hours}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eficiencia</p>
              <p className="text-2xl font-bold">{data.efficiency}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latencia</p>
              <p className="text-2xl font-bold">{data.latency_min} min</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Fases de Sueño</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sueño Profundo:</span>
                <span className="font-medium">{data.deep_sleep_min} min</span>
              </div>
              <div className="flex justify-between">
                <span>Fase de Sueños (REM):</span>
                <span className="font-medium">{data.rem_sleep_min} min</span>
              </div>
              <div className="flex justify-between">
                <span>Sueño Ligero:</span>
                <span className="font-medium">{data.light_sleep_min} min</span>
              </div>
            </div>
          </div>

          {data.bedtime_start && data.bedtime_end && (
            <div>
              <h4 className="font-semibold mb-2">Horarios</h4>
              <div className="flex justify-between">
                <span>A dormir:</span>
                <span className="font-medium">{data.bedtime_start}</span>
              </div>
              <div className="flex justify-between">
                <span>Despertar:</span>
                <span className="font-medium">{data.bedtime_end}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
