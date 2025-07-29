import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Camera, Upload, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react'

const AddExpense = ({ onExpenseAdded }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    receipt_image_base64: ''
  })

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Personal Care',
    'Other'
  ]

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Other'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1] // Remove data:image/jpeg;base64, prefix
        setFormData(prev => ({
          ...prev,
          receipt_image_base64: base64
        }))
        toast({
          title: "Receipt uploaded",
          description: "Receipt image has been attached to your expense",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.payment_method) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const success = await onExpenseAdded(formData)
      
      if (success) {
        toast({
          title: "Expense added successfully",
          description: "Your expense has been recorded",
        })
        
        // Reset form
        setFormData({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          payment_method: '',
          receipt_image_base64: ''
        })
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        toast({
          title: "Error adding expense",
          description: "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error adding expense",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Expense</h1>
        <p className="text-gray-600">Record your spending quickly and easily</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="text-lg"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Payment Method *
              </Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="How did you pay?" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What did you spend on? (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Receipt (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.receipt_image_base64 ? 'Receipt uploaded ✓' : 'Click to upload receipt'}
                  </span>
                  <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddExpense

