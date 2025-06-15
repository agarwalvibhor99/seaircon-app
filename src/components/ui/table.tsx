'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  columns: TableColumn[]
  data: any[]
  onRowClick?: (row: any) => void
  className?: string
  emptyMessage?: string
  loading?: boolean
}

interface TableRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export function Table({
  columns,
  data,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loading = false
}: TableProps) {
  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : undefined}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={column.key}
                    className={cn('px-6 py-4 whitespace-nowrap', column.className)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors duration-150',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
      {children}
    </td>
  )
}

// Simple table components for basic layouts
export function SimpleTable({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  )
}

export function TableHeaderCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </th>
  )
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  )
}

export default Table
