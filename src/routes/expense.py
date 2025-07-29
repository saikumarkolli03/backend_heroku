from flask import Blueprint, jsonify, request
from datetime import datetime
import os
import base64
from src.models.expense import Expense, db
from src.models.user import User

expense_bp = Blueprint('expense', __name__)

@expense_bp.route('/expenses', methods=['GET'])
def get_expenses():
    # For now, we'll assume user_id=1 (we'll add proper auth later)
    user_id = request.args.get('user_id', 1, type=int)
    month = request.args.get('month')  # Format: YYYY-MM
    category = request.args.get('category')
    
    query = Expense.query.filter_by(user_id=user_id)
    
    if month:
        try:
            year, month_num = map(int, month.split('-'))
            query = query.filter(
                db.extract('year', Expense.date) == year,
                db.extract('month', Expense.date) == month_num
            )
        except ValueError:
            return jsonify({'error': 'Invalid month format. Use YYYY-MM'}), 400
    
    if category:
        query = query.filter(Expense.category == category)
    
    expenses = query.order_by(Expense.date.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses])

@expense_bp.route('/expenses', methods=['POST'])
def create_expense():
    data = request.json
    
    # For now, we'll assume user_id=1 (we'll add proper auth later)
    user_id = data.get('user_id', 1)
    
    # Validate required fields
    required_fields = ['amount', 'category', 'payment_method']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Parse date
    date_str = data.get('date')
    if date_str:
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    else:
        date = datetime.utcnow().date()
    
    # Handle receipt image
    receipt_image_path = None
    if 'receipt_image_base64' in data and data['receipt_image_base64']:
        try:
            # Create uploads directory if it doesn't exist
            uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            # Decode base64 image
            image_data = base64.b64decode(data['receipt_image_base64'])
            
            # Generate filename
            filename = f"receipt_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
            filepath = os.path.join(uploads_dir, filename)
            
            # Save image
            with open(filepath, 'wb') as f:
                f.write(image_data)
            
            receipt_image_path = f"uploads/{filename}"
            
        except Exception as e:
            return jsonify({'error': f'Failed to process receipt image: {str(e)}'}), 400
    
    # Create expense
    expense = Expense(
        user_id=user_id,
        amount=float(data['amount']),
        category=data['category'],
        description=data.get('description', ''),
        date=date,
        payment_method=data['payment_method'],
        receipt_image_path=receipt_image_path
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify(expense.to_dict()), 201

@expense_bp.route('/expenses/<int:expense_id>', methods=['GET'])
def get_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    return jsonify(expense.to_dict())

@expense_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    data = request.json
    
    # Update fields
    if 'amount' in data:
        expense.amount = float(data['amount'])
    if 'category' in data:
        expense.category = data['category']
    if 'description' in data:
        expense.description = data['description']
    if 'payment_method' in data:
        expense.payment_method = data['payment_method']
    if 'date' in data:
        try:
            expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    db.session.commit()
    return jsonify(expense.to_dict())

@expense_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    
    # Delete receipt image if exists
    if expense.receipt_image_path:
        image_path = os.path.join(os.path.dirname(__file__), '..', 'static', expense.receipt_image_path)
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(expense)
    db.session.commit()
    return '', 204

