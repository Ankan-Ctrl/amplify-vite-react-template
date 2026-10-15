import React from 'react';
import { DecisionInsight, ActiveTab } from '../../types';
import { AlertTriangle, TrendingUp, CheckCircle, Info, ArrowRight, SlidersHorizontal } from 'lucide-react';

interface DecisionAssistantProps {
  insights: DecisionInsight[];
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DecisionAssistant: React.FC<DecisionAssistantProps> = ({
  insights,
  onNavigateTab,
}) => {
  const getIcon = (type: DecisionInsight['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={17} className="insight-icon icon-alert" />;
      case 'opportunity':
        return <TrendingUp size={17} className="insight-icon icon-opp" />;
      case 'positive':
        return <CheckCircle size={17} className="insight-icon icon-pos" />;
      default:
        return <Info size={17} className="insight-icon icon-info" />;
    }
  };

  return (
    <div className="card decision-engine-card">
      <div className="decision-header">
        <div className="decision-title-group">
          <div className="decision-rule-badge">
            <SlidersHorizontal size={13} />
            <span>Operational Decision Engine</span>
          </div>
          <h3 className="section-title">Automated Business Triggers & Action Items</h3>
          <p className="section-subtitle">
            Deterministic business checks tracking working capital, inventory reorder thresholds, and customer concentration risk.
          </p>
        </div>
      </div>

      <div className="decision-grid">
        {insights.map((insight) => (
          <div key={insight.id} className={`insight-card insight-${insight.type}`}>
            <div>
              <div className="insight-header">
                <div className="insight-icon-bubble">{getIcon(insight.type)}</div>
                <h4 className="insight-title">{insight.title}</h4>
              </div>

              <p className="insight-desc">{insight.description}</p>
            </div>

            <div>
              <div className="insight-impact">
                <span className="impact-tag">Impact:</span> {insight.impact}
              </div>

              {insight.actionLabel && insight.actionTab && (
                <button
                  className="btn btn-ghost btn-xs insight-action-btn"
                  onClick={() => onNavigateTab(insight.actionTab!)}
                >
                  <span>{insight.actionLabel}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
