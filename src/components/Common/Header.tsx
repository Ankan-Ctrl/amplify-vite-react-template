import React from 'react';
import { Activity, Cloud, LogOut, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  userEmail: string;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  userEmail,
  onSignOut,
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
          <span className="cloud-status-text">AWS backend configured</span>
          <span className="env-badge">Cloud</span>
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

        <span className="header-user-email" title={userEmail}>{userEmail}</span>
        <button
          className="btn btn-ghost btn-sm text-muted flex-align"
          onClick={onSignOut}
          title="Sign out of BizPulse"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
};
