import fitz  # PyMuPDF
import os

pdf_folder = r"c:\Users\Vinay\Desktop\Heart disease Prediction Papers"
output_folder = os.path.join(pdf_folder, "extracted_text")
os.makedirs(output_folder, exist_ok=True)

for filename in os.listdir(pdf_folder):
    if filename.endswith(".pdf"):
        pdf_path = os.path.join(pdf_folder, filename)
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            
            # Save to text file
            txt_filename = filename.replace(".pdf", ".txt")
            txt_path = os.path.join(output_folder, txt_filename)
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"Extracted: {filename}")
        except Exception as e:
            print(f"Error with {filename}: {e}")

print("\nDone! All PDFs extracted to:", output_folder)
