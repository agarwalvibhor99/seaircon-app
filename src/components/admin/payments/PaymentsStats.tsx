'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { IndianRupee } from '@/components/ui/icons/indian-rupee'
import { Calendar, FileText } from 'lucide-react'

interface Payment {
  amount: number
  payment_date: string
}

interface PaymentsStatsProps {
  payments: Payment[]
}

export default function PaymentsStats({ payments }: PaymentsStatsProps) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const stats = {
    totalPayments: payments.reduce((sum, payment) => sum + payment.amount, 0),
    totalCount: payments.length,
    thisMonthPayments: payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    }).reduce((sum, payment) => sum + payment.amount, 0),
    thisMonthCount: payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    }).length
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    { 
      title: 'Total Payments', 
      value: formatCurrency(stats.totalPayments), 
      subtitle: 'All time revenue',
      icon: IndianRupee, 
      color: 'text-green-600' 
    },
    { 
      title: 'This Month', 
      value: formatCurrency(stats.thisMonthPayments), 
      subtitle: `${stats.thisMonthCount} payments`,
      icon: Calendar, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Total Records', 
      value: stats.totalCount, 
      subtitle: 'Payment records',
      icon: FileText, 
      color: 'text-purple-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={3} />
}
