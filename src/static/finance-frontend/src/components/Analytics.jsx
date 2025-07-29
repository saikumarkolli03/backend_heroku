import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [trendsData, setTrendsData] = useState([])
  const [paymentMethodData, setPaymentMethodData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  useEffect(() => {
    fetchAnalytics()
  }, [selectedMonth])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch monthly data
      const monthlyResponse = await fetch('/api/metrics/monthly')
      if (monthlyResponse.ok) {
        const monthlyResult = await monthlyResponse.json()
        setMonthlyData(monthlyResult.monthly_summary)
      }

      // Fetch category data
      const categoryUrl = selectedMonth 
        ? `/api/metrics/category?month=${selectedMonth}`
        : '/api/metrics/category'
      const categoryResponse = await fetch(categoryUrl)
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json()
        setCategoryData(categoryResult.category_summary)
      }

      // Fetch trends data
      const trendsResponse = await fetch('/api/metrics/trends')
      if (trendsResponse.ok) {
        const trendsResult = await trendsResponse.json()
        setTrendsData(trendsResult.daily_trends)
        setPaymentMethodData(trendsResult.payment_methods)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getMonthOptions = () => {
    return monthlyData.map(item => ({
      value: item.period,
      label: `${item.month_name} ${item.year}`
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Insights into your spending patterns</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights into your spending patterns</p>
      </div>

      {/* Month Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filter by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All months</SelectItem>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Spending Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month_name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.month_name} ${payload[0].payload.year}`
                      }
                      return label
                    }}
                  />
                  <Bar dataKey="total_amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2" />
                Spending by Category
                {selectedMonth && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({getMonthOptions().find(opt => opt.value === selectedMonth)?.label})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Spending Trend */}
        {trendsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Daily Spending (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsData.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        {paymentMethodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="payment_method" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                  <Bar dataKey="total_amount" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Statistics */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Transactions</th>
                    <th className="text-right py-2">Average</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{category.category}</td>
                      <td className="text-right py-2">{formatCurrency(category.total_amount)}</td>
                      <td className="text-right py-2">{category.transaction_count}</td>
                      <td className="text-right py-2">{formatCurrency(category.average_amount)}</td>
                      <td className="text-right py-2">{category.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Analytics

