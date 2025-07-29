import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, List, BarChart3, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/add-expense', label: 'Add Expense', icon: Plus },
    { path: '/expenses', label: 'Expenses', icon: List },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Finance Assistant</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-600"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-700" : "text-gray-600"
                  )} />
                  <span className={cn(
                    isActive ? "text-blue-700" : "text-gray-600"
                  )}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

