import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#1C2526',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p
              style={{
                fontSize: '13px',
                color: '#6B7A7A',
                marginTop: '4px',
                maxWidth: '680px',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

