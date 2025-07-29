from flask import Blueprint, jsonify, request
from sqlalchemy import func, extract
from src.models.expense import Expense, db
from collections import defaultdict
import calendar

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/metrics/monthly', methods=['GET'])
def get_monthly_metrics():
    # For now, we'll assume user_id=1 (we'll add proper auth later)
    user_id = request.args.get('user_id', 1, type=int)
    
    # Get monthly spending totals
    monthly_data = db.session.query(
        extract('year', Expense.date).label('year'),
        extract('month', Expense.date).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter_by(user_id=user_id).group_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).order_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).all()
    
    # Format the data
    monthly_summary = []
    for year, month, total in monthly_data:
        month_name = calendar.month_name[int(month)]
        monthly_summary.append({
            'year': int(year),
            'month': int(month),
            'month_name': month_name,
            'total_amount': float(total),
            'period': f"{year}-{month:02d}"
        })
    
    return jsonify({
        'monthly_summary': monthly_summary,
        'total_months': len(monthly_summary)
    })

@analytics_bp.route('/metrics/category', methods=['GET'])
def get_category_metrics():
    # For now, we'll assume user_id=1 (we'll add proper auth later)
    user_id = request.args.get('user_id', 1, type=int)
    month = request.args.get('month')  # Format: YYYY-MM
    
    query = db.session.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter_by(user_id=user_id)
    
    if month:
        try:
            year, month_num = map(int, month.split('-'))
            query = query.filter(
                extract('year', Expense.date) == year,
                extract('month', Expense.date) == month_num
            )
        except ValueError:
            return jsonify({'error': 'Invalid month format. Use YYYY-MM'}), 400
    
    category_data = query.group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).all()
    
    # Format the data
    category_summary = []
    total_amount = 0
    for category, total, count in category_data:
        category_summary.append({
            'category': category,
            'total_amount': float(total),
            'transaction_count': count,
            'average_amount': float(total) / count if count > 0 else 0
        })
        total_amount += float(total)
    
    # Calculate percentages
    for item in category_summary:
        item['percentage'] = (item['total_amount'] / total_amount * 100) if total_amount > 0 else 0
    
    return jsonify({
        'category_summary': category_summary,
        'total_amount': total_amount,
        'total_categories': len(category_summary)
    })

@analytics_bp.route('/metrics/trends', methods=['GET'])
def get_spending_trends():
    # For now, we'll assume user_id=1 (we'll add proper auth later)
    user_id = request.args.get('user_id', 1, type=int)
    
    # Get daily spending for the last 30 days
    daily_data = db.session.query(
        Expense.date,
        func.sum(Expense.amount).label('daily_total')
    ).filter_by(user_id=user_id).group_by(Expense.date).order_by(Expense.date.desc()).limit(30).all()
    
    # Get payment method breakdown
    payment_data = db.session.query(
        Expense.payment_method,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter_by(user_id=user_id).group_by(Expense.payment_method).all()
    
    # Format daily data
    daily_trends = []
    for date, total in daily_data:
        daily_trends.append({
            'date': date.isoformat(),
            'amount': float(total)
        })
    
    # Format payment method data
    payment_methods = []
    for method, total, count in payment_data:
        payment_methods.append({
            'payment_method': method,
            'total_amount': float(total),
            'transaction_count': count
        })
    
    return jsonify({
        'daily_trends': daily_trends,
        'payment_methods': payment_methods
    })

