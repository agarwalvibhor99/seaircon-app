'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface LineItemsFieldProps {
  label: string
  value: QuotationItem[]
  onChange: (items: QuotationItem[]) => void
  error?: string
  required?: boolean
  onTotalsChange?: (totals: {
    subtotal: number
    taxAmount: number
    discountAmount: number
    totalAmount: number
  }) => void
  taxRate?: number
  discountPercentage?: number
}

export function LineItemsField({
  label,
  value = [],
  onChange,
  error,
  required,
  onTotalsChange,
  taxRate = 18,
  discountPercentage = 0
}: LineItemsFieldProps) {
  const [items, setItems] = useState<QuotationItem[]>(() => 
    value.length > 0 ? value : [
      {
        id: '1',
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }
    ]
  )

  // Update items when value prop changes
  useEffect(() => {
    if (value.length > 0 && value !== items) {
      setItems(value)
    }
  }, [value])

  // Calculate totals and notify parent
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = (subtotal * discountPercentage) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * taxRate) / 100
    const totalAmount = taxableAmount + taxAmount

    if (onTotalsChange) {
      onTotalsChange({
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount
      })
    }
  }, [items, taxRate, discountPercentage])

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
    const newItems = [...items, newItem]
    setItems(newItems)
    onChange(newItems)
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      onChange(newItems)
    }
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price
        }
        return updated
      }
      return item
    })
    setItems(newItems)
    onChange(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discountPercentage) / 100
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const totalAmount = taxableAmount + taxAmount

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className={`text-base font-medium ${required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}`}>
          {label}
        </Label>
        <Button onClick={addItem} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Unit Price (₹)</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Total (₹)</Label>
                    <Input
                      value={item.total.toLocaleString('en-IN')}
                      readOnly
                      className="mt-1 bg-white"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Totals Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountPercentage}%):</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax/GST ({taxRate}%):</span>
            <span>₹{taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
