import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import AddExpense from './components/AddExpense'
import ExpenseList from './components/ExpenseList'
import Analytics from './components/Analytics'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const addExpense = async (expenseData) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      })
      
      if (response.ok) {
        const newExpense = await response.json()
        setExpenses(prev => [newExpense, ...prev])
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding expense:', error)
      return false
    }
  }

  const deleteExpense = async (expenseId) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId))
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting expense:', error)
      return false
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  expenses={expenses} 
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/add-expense" 
              element={
                <AddExpense 
                  onExpenseAdded={addExpense}
                />
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ExpenseList 
                  expenses={expenses}
                  onDeleteExpense={deleteExpense}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <Analytics />
              } 
            />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App

