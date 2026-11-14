import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptySubtitle = 'There are currently no records matching the criteria.',
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  if (data.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4EBEA',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#F6F8F8',
            color: '#6B7A7A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <Inbox size={24} />
        </div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1C2526', marginBottom: '4px' }}>
          {emptyTitle}
        </h4>
        <p style={{ fontSize: '13px', color: '#6B7A7A', maxWidth: '380px' }}>
          {emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4EBEA',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(28, 37, 38, 0.04)',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#F9FAFA', borderBottom: '1px solid #E4EBEA' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#6B7A7A',
                    width: col.width,
                    textAlign: col.align || 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                style={{
                  borderBottom: rowIdx === paginatedData.length - 1 ? 'none' : '1px solid #E4EBEA',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = '#F9FAFA';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {columns.map((col, colIdx) => {
                  const content = col.render
                    ? col.render(item, startIndex + rowIdx)
                    : col.accessorKey
                    ? (item[col.accessorKey] as React.ReactNode)
                    : null;

                  return (
                    <td
                      key={colIdx}
                      style={{
                        padding: '14px 16px',
                        fontSize: '13px',
                        color: '#1C2526',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                      }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #E4EBEA',
            backgroundColor: '#F9FAFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#6B7A7A',
          }}
        >
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, data.length)} of {data.length} records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E4EBEA',
                backgroundColor: '#FFFFFF',
                color: currentPage === 1 ? '#CDD8D6' : '#1C2526',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ fontWeight: 600, color: '#1C2526' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #E4EBEA',
                backgroundColor: '#FFFFFF',
                color: currentPage === totalPages ? '#CDD8D6' : '#1C2526',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

