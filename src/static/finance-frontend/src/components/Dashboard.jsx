import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = ({ expenses, loading }) => {
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    avgDaily: 0,
    transactionCount: 0
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  useEffect(() => {
    if (expenses.length > 0) {
      calculateStats()
      fetchAnalytics()
    }
  }, [expenses])

  const calculateStats = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const thisMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    )
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Calculate average daily spending for current month
    const daysInMonth = new Date().getDate()
    const avgDaily = thisMonthTotal / daysInMonth

    setStats({
      totalExpenses: total,
      thisMonth: thisMonthTotal,
      avgDaily: avgDaily,
      transactionCount: expenses.length
    })
  }

  const fetchAnalytics = async () => {
    try {
      // Fetch monthly data
      const monthlyResponse = await fetch('/api/metrics/monthly')
      if (monthlyResponse.ok) {
        const monthlyResult = await monthlyResponse.json()
        setMonthlyData(monthlyResult.monthly_summary.slice(-6)) // Last 6 months
      }

      // Fetch category data
      const categoryResponse = await fetch('/api/metrics/category')
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json()
        setCategoryData(categoryResult.category_summary.slice(0, 6)) // Top 6 categories
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your spending and financial insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            <p className="text-blue-100 text-xs">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <p className="text-green-100 text-xs">Current month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgDaily)}</div>
            <p className="text-purple-100 text-xs">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
            <p className="text-orange-100 text-xs">Total count</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No expenses recorded yet</p>
              <p className="text-sm text-gray-400 mt-2">Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description || 'No description'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {expense.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{expense.payment_method}</span>
                          <span className="text-xs text-gray-500">{expense.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month_name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total_amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
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
        </div>
      )}
    </div>
  )
}

export default Dashboard

