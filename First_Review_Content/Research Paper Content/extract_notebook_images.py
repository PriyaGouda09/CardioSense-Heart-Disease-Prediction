import json
import base64
import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Read notebook
notebook_path = 'Heart_Disease_Complete.ipynb'
with open(notebook_path, 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Create figures directory
figures_dir = Path('figures')
figures_dir.mkdir(exist_ok=True)

# Extract and save images
image_data = {
    14: ('Fig1_Boxplots_Outliers', 'Boxplots of numerical features before outlier clipping (IQR method).'),
    19: ('Fig2_Distributions', 'Distributions of numerical features (histograms with KDE).'),
    21: ('Fig3_CategoricalCounts', 'Categorical feature distributions across the dataset.'),
    24: ('Fig4_NumericalVsTarget', 'Numerical features stratified by target class (disease severity).'),
    26: ('Fig5_CategoricalVsTarget', 'Categorical features versus heart disease severity.'),
    28: ('Fig6_Heatmap', 'Pearson correlation matrix across all features and target variable.'),
    30: ('Fig7_PairPlot', 'Pair plot of key numerical features stratified by disease severity.'),
    34: ('Fig8_EngineeredFeatures', 'Engineered features versus heart disease severity.'),
    48: ('Fig9_ConfusionMatrices', 'Confusion matrices on test set showing per-class predictions.'),
    50: ('Fig10_ModelComparison', 'Model comparison accuracy and Random Forest feature importances.')
}

saved_images = {}
cell_counter = 0

for cell in notebook['cells']:
    cell_counter += 1
    
    if 'outputs' in cell and len(cell['outputs']) > 0:
        for output in cell['outputs']:
            if output.get('output_type') == 'display_data' and 'data' in output:
                if 'image/png' in output['data']:
                    img_data = output['data']['image/png']
                    
                    # Find matching cell number
                    for cell_num, (fig_name, fig_desc) in image_data.items():
                        if cell_counter == cell_num:
                            # Decode and save image
                            img_bytes = base64.b64decode(img_data)
                            img_path = figures_dir / f'{fig_name}.png'
                            with open(img_path, 'wb') as img_file:
                                img_file.write(img_bytes)
                            saved_images[cell_counter] = (img_path, fig_name, fig_desc)
                            print(f"✓ Extracted {fig_name}.png (Cell {cell_num})")
                            break

print(f"\n✓ Total images extracted: {len(saved_images)}")
print(f"✓ All images saved to: {figures_dir}/")
