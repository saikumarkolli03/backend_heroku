import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.expense import Expense  # Import to ensure table creation
from src.routes.user import user_bp
from src.routes.expense import expense_bp
from src.routes.analytics import analytics_bp
# from src.routes.ocr import ocr_bp  # Temporarily disabled for deployment

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Enable CORS for all routes
CORS(app, origins=["*"])

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(expense_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
# app.register_blueprint(ocr_bp, url_prefix='/api')  # Temporarily disabled for deployment

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
with app.app_context():
    db.init_app(app)
    db.create_all()

@app.route('/')
def index():
    return {"message": "Personal Finance Assistant API", "status": "running"}

@app.route('/health')
def health():
    return {"status": "healthy"}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

