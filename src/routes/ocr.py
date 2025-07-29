from flask import Blueprint, jsonify, request
import os
import base64
from datetime import datetime
from src.utils.ocr_processor import ReceiptProcessor

ocr_bp = Blueprint('ocr', __name__)
processor = ReceiptProcessor()

@ocr_bp.route('/process-receipt', methods=['POST'])
def process_receipt():
    """Process a receipt image and extract information using OCR"""
    try:
        data = request.json
        
        if 'image_base64' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image_base64'])
        except Exception as e:
            return jsonify({'error': 'Invalid base64 image data'}), 400
        
        # Create temporary file for processing
        temp_dir = os.path.join(os.path.dirname(__file__), '..', 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_filename = f"receipt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        temp_filepath = os.path.join(temp_dir, temp_filename)
        
        # Save image to temporary file
        with open(temp_filepath, 'wb') as f:
            f.write(image_data)
        
        # Process the receipt
        result = processor.process_receipt(temp_filepath)
        
        # Clean up temporary file
        try:
            os.remove(temp_filepath)
        except:
            pass  # Ignore cleanup errors
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'amount': result.get('amount'),
                    'date': result.get('date'),
                    'merchant': result.get('merchant'),
                    'suggested_category': result.get('suggested_category'),
                    'extracted_text': result.get('extracted_text'),
                    'confidence': result.get('confidence', 'low')
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error occurred')
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@ocr_bp.route('/test-ocr', methods=['GET'])
def test_ocr():
    """Test endpoint to verify OCR functionality"""
    try:
        # Test the OCR processor with sample text
        test_text = """
        WALMART SUPERCENTER
        123 MAIN ST
        ANYTOWN, ST 12345
        
        GROCERIES
        MILK                 $3.99
        BREAD                $2.49
        EGGS                 $4.99
        
        SUBTOTAL            $11.47
        TAX                  $0.92
        TOTAL               $12.39
        
        12/25/2023 14:30
        """
        
        amount = processor.extract_amount(test_text)
        date = processor.extract_date(test_text)
        merchant = processor.extract_merchant(test_text)
        category = processor.categorize_expense(merchant, test_text)
        
        return jsonify({
            'success': True,
            'test_results': {
                'amount': amount,
                'date': date,
                'merchant': merchant,
                'category': category,
                'extracted_text': test_text.strip()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Test failed: {str(e)}'
        }), 500

