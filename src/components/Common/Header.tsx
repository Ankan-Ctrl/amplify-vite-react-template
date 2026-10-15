import React from 'react';
import { Activity, RotateCcw, Cloud, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  onResetDemoData,
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-badge" onClick={() => onNavigateTab('overview')}>
          <div className="brand-icon-wrap">
            <Activity size={22} className="brand-pulse-icon" />
          </div>
          <div className="brand-text">
            <h1 className="brand-name">
              BizPulse<span className="brand-accent">.</span>
            </h1>
            <span className="brand-tagline">AWS Business Analytics</span>
          </div>
        </div>

        <div className="cloud-indicator-pill" onClick={() => onNavigateTab('architecture')}>
          <span className="status-dot-pulse"></span>
          <Cloud size={14} className="cloud-icon" />
          <span className="cloud-status-text">Amplify Gen 2 / DynamoDB Ready</span>
          <span className="env-badge">Local PC Demo</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className={`btn btn-sm ${activeTab === 'architecture' ? 'btn-primary' : 'btn-outline'} flex-align`}
          onClick={() => onNavigateTab('architecture')}
          title="Inspect Cloud Architecture and technical details"
        >
          <ShieldCheck size={15} />
          <span>AWS Architecture</span>
        </button>

        <button
          className="btn btn-ghost btn-sm text-muted flex-align"
          onClick={onResetDemoData}
          title="Reset all modified figures back to standard sample dataset"
        >
          <RotateCcw size={14} />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </header>
  );
};
