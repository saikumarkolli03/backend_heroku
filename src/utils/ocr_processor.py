import pytesseract
import cv2
import numpy as np
from PIL import Image
import re
import os

class ReceiptProcessor:
    def __init__(self):
        # Common patterns for extracting information from receipts
        self.amount_patterns = [
            r'\$?(\d+\.?\d{0,2})',  # Dollar amounts
            r'total[:\s]*\$?(\d+\.?\d{0,2})',  # Total amounts
            r'amount[:\s]*\$?(\d+\.?\d{0,2})',  # Amount
        ]
        
        self.date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # MM/DD/YYYY or MM-DD-YYYY
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',    # YYYY/MM/DD or YYYY-MM-DD
        ]
        
        # Common merchant/store patterns
        self.merchant_patterns = [
            r'^([A-Z\s&]+)(?:\n|\r)',  # Store name usually at top
            r'([A-Z][A-Za-z\s&]+)\s*(?:STORE|SHOP|MARKET|RESTAURANT)',
        ]

    def preprocess_image(self, image_path):
        """Preprocess the image for better OCR results"""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply noise reduction
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply threshold to get binary image
            _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations to clean up the image
            kernel = np.ones((1, 1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return cleaned
            
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            return None

    def extract_text_from_image(self, image_path):
        """Extract text from receipt image using OCR"""
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                # Fallback to original image
                processed_image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            # Convert to PIL Image for pytesseract
            pil_image = Image.fromarray(processed_image)
            
            # Extract text using pytesseract
            custom_config = r'--oem 3 --psm 6'  # OCR Engine Mode 3, Page Segmentation Mode 6
            text = pytesseract.image_to_string(pil_image, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            print(f"Error extracting text from image: {str(e)}")
            return ""

    def extract_amount(self, text):
        """Extract monetary amounts from text"""
        amounts = []
        
        for pattern in self.amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    amount = float(match.replace('$', '').replace(',', ''))
                    if 0.01 <= amount <= 10000:  # Reasonable range for expenses
                        amounts.append(amount)
                except ValueError:
                    continue
        
        # Return the largest amount found (likely the total)
        return max(amounts) if amounts else None

    def extract_date(self, text):
        """Extract date from text"""
        for pattern in self.date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]  # Return first date found
        return None

    def extract_merchant(self, text):
        """Extract merchant/store name from text"""
        lines = text.split('\n')
        
        # Try to find merchant name in first few lines
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if len(line) > 3 and line.isupper():
                # Clean up the merchant name
                merchant = re.sub(r'[^\w\s&]', '', line).strip()
                if len(merchant) > 2:
                    return merchant
        
        return None

    def categorize_expense(self, merchant_name, text):
        """Attempt to categorize the expense based on merchant and text content"""
        if not merchant_name:
            merchant_name = ""
        
        text_lower = text.lower()
        merchant_lower = merchant_name.lower()
        
        # Define category keywords
        categories = {
            'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'kitchen', 'grill', 'bar'],
            'Transportation': ['gas', 'fuel', 'station', 'uber', 'lyft', 'taxi', 'metro', 'bus', 'parking'],
            'Shopping': ['store', 'shop', 'retail', 'mall', 'market', 'walmart', 'target', 'amazon'],
            'Healthcare': ['pharmacy', 'hospital', 'clinic', 'medical', 'doctor', 'cvs', 'walgreens'],
            'Entertainment': ['movie', 'theater', 'cinema', 'game', 'entertainment', 'netflix', 'spotify'],
            'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
        }
        
        # Check merchant name and text for category keywords
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in merchant_lower or keyword in text_lower:
                    return category
        
        return 'Other'

    def process_receipt(self, image_path):
        """Main method to process a receipt image and extract information"""
        try:
            # Extract text from image
            text = self.extract_text_from_image(image_path)
            
            if not text:
                return {
                    'success': False,
                    'error': 'Could not extract text from image'
                }
            
            # Extract information
            amount = self.extract_amount(text)
            date = self.extract_date(text)
            merchant = self.extract_merchant(text)
            category = self.categorize_expense(merchant, text)
            
            return {
                'success': True,
                'extracted_text': text,
                'amount': amount,
                'date': date,
                'merchant': merchant,
                'suggested_category': category,
                'confidence': 'medium' if amount and (date or merchant) else 'low'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error processing receipt: {str(e)}'
            }

# Test function
def test_ocr():
    processor = ReceiptProcessor()
    
    # Create a simple test
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
    
    print(f"Amount: {amount}")
    print(f"Date: {date}")
    print(f"Merchant: {merchant}")
    print(f"Category: {category}")

if __name__ == "__main__":
    test_ocr()

