import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BufferGeometry } from 'three';

const ModelViewer = lazy(() => import('../infrastructure/viewer/ModelViewer'));

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface ViewerPanelProps {
  readonly geometry: BufferGeometry | null;
  readonly color: string;
  readonly overhangAngleDeg: number;
  readonly buildVolumeMm: { readonly x: number; readonly y: number; readonly z: number };
}

export function ViewerPanel({ geometry, color, overhangAngleDeg, buildVolumeMm }: ViewerPanelProps) {
  const { t } = useTranslation('quote');
  const [showOverhangs, setShowOverhangs] = useState(false);
  return (
    <div className="viewer">
      {geometry ? (
        <ViewerBoundary fallback={<p className="viewer__placeholder">{t('viewer.unavailable')}</p>}>
          <Suspense fallback={<p className="viewer__placeholder">{t('viewer.loading')}</p>}>
            <ModelViewer
              geometry={geometry}
              color={color}
              showOverhangs={showOverhangs}
              overhangAngleDeg={overhangAngleDeg}
              buildVolumeMm={buildVolumeMm}
              label={t('viewer.label')}
            />
          </Suspense>
        </ViewerBoundary>
      ) : (
        <p className="viewer__placeholder">{t('viewer.empty')}</p>
      )}
      {geometry && (
        <div className="viewer__toolbar">
          <label className="checkbox">
            <input type="checkbox" checked={showOverhangs} onChange={(e) => setShowOverhangs(e.target.checked)} />
            {t('viewer.showOverhangs')}
          </label>
          <span className="muted viewer__help">{t('viewer.help')}</span>
        </div>
      )}
    </div>
  );
}
