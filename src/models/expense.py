from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date())
    payment_method = db.Column(db.String(50), nullable=False)
    receipt_image_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with User
    user = db.relationship('User', backref=db.backref('expenses', lazy=True))

    def __repr__(self):
        return f'<Expense {self.id}: {self.amount} - {self.category}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'category': self.category,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'payment_method': self.payment_method,
            'receipt_image_path': self.receipt_image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

