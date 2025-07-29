import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, Trash2, Receipt, Calendar, DollarSign } from 'lucide-react'

const ExpenseList = ({ expenses, onDeleteExpense, loading }) => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const categories = [...new Set(expenses.map(expense => expense.category))].sort()
  const months = [...new Set(expenses.map(expense => expense.date.slice(0, 7)))].sort().reverse()

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || expense.category === categoryFilter
    const matchesMonth = !monthFilter || expense.date.startsWith(monthFilter)
    
    return matchesSearch && matchesCategory && matchesMonth
  })

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const success = await onDeleteExpense(expenseId)
      if (success) {
        toast({
          title: "Expense deleted",
          description: "The expense has been removed successfully",
        })
      } else {
        toast({
          title: "Error deleting expense",
          description: "Please try again",
          variant: "destructive",
        })
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
          <p className="text-gray-600">Manage and review your spending</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600">Manage and review your spending</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-bold">{filteredExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-xl font-bold">
                  {filteredExpenses.length > 0 
                    ? formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredExpenses.length} Expense{filteredExpenses.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No expenses found</p>
              <p className="text-gray-400 text-sm mt-2">
                {expenses.length === 0 
                  ? "Add your first expense to get started!"
                  : "Try adjusting your filters"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {expense.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="text-xs">
                            {expense.category}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(expense.date)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {expense.payment_method}
                          </span>
                          {expense.receipt_image_path && (
                            <Badge variant="outline" className="text-xs">
                              <Receipt className="h-3 w-3 mr-1" />
                              Receipt
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-lg text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExpenseList

