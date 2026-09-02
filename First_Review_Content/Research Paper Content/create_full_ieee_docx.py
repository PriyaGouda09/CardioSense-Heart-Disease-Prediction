from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def add_heading_section(doc, heading_text):
    """Add a main section heading (Roman numerals)"""
    heading = doc.add_paragraph()
    heading_run = heading.add_run(heading_text)
    heading_run.font.size = Pt(10)
    heading_run.font.bold = True
    heading_run.font.name = 'Times New Roman'
    return heading

def add_body_paragraph(doc, text):
    """Add a body paragraph with correct formatting"""
    para = doc.add_paragraph(text)
    for run in para.runs:
        run.font.size = Pt(10)
        run.font.name = 'Times New Roman'
    return para

# Create document
doc = Document()

# Set up margins (IEEE standard)
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)

# ===== TITLE PAGE =====
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_run = title.add_run("AN EXPLAINABLE MACHINE LEARNING FRAMEWORK FOR MULTICLASS CARDIOVASCULAR DISEASE SEVERITY PREDICTION USING THE UCI HEART DISEASE DATASET")
title_run.font.size = Pt(14)
title_run.font.bold = True
title_run.font.name = 'Times New Roman'

# AUTHORS
authors = doc.add_paragraph()
authors.alignment = WD_ALIGN_PARAGRAPH.CENTER
authors_run = authors.add_run("Prisha Surve¹*, Priya Gouda², Rhea Suresh³")
authors_run.font.size = Pt(10)
authors_run.font.name = 'Times New Roman'

# AFFILIATIONS
affil = doc.add_paragraph()
affil.alignment = WD_ALIGN_PARAGRAPH.CENTER
affil_run = affil.add_run("¹²³Department of Computer Engineering, K.J. Somaiya School of Engineering,")
affil_run.font.size = Pt(9)
affil_run.font.name = 'Times New Roman'

affil2 = doc.add_paragraph()
affil2.alignment = WD_ALIGN_PARAGRAPH.CENTER
affil2_run = affil2.add_run("Somaiya Vidyavihar University, Mumbai, India")
affil2_run.font.size = Pt(9)
affil2_run.font.name = 'Times New Roman'

# EMAILS
emails = doc.add_paragraph()
emails.alignment = WD_ALIGN_PARAGRAPH.CENTER
emails_run = emails.add_run("prisha.surve@somaiya.edu, priya.gouda@somaiya.edu, rhea.suresh@somaiya.edu")
emails_run.font.size = Pt(9)
emails_run.font.name = 'Times New Roman'

emails_corr = doc.add_paragraph()
emails_corr.alignment = WD_ALIGN_PARAGRAPH.CENTER
emails_corr_run = emails_corr.add_run("*Corresponding author: prisha.surve@somaiya.edu")
emails_corr_run.font.size = Pt(9)
emails_corr_run.font.name = 'Times New Roman'
emails_corr_run.italic = True

doc.add_paragraph()  # Spacing

# ===== ABSTRACT =====
abstract_para = doc.add_paragraph()
abstract_label = abstract_para.add_run("Abstract—")
abstract_label.italic = True
abstract_label.font.name = 'Times New Roman'
abstract_label.font.size = Pt(10)

abstract_text = abstract_para.add_run("Cardiovascular disease remains the leading cause of mortality worldwide, accounting for nearly one-third of global deaths annually. While existing machine learning models often formulate the problem as binary classification—disease present or absent—clinical practice requires granular severity staging to guide treatment decisions. This study addresses the multiclass cardiovascular disease severity prediction challenge using the publicly available UCI Heart Disease Dataset. We applied a complete preprocessing and feature engineering pipeline, developed five clinically motivated engineered features, and trained three baseline classifiers (Support Vector Machine, Random Forest, and Multilayer Perceptron) with systematic hyperparameter tuning via GridSearchCV. Our best model, a neural network architecture with a (128, 64) hidden layer structure, achieved 59.24% test accuracy across five severity classes. All models demonstrated substantially lower performance on the two most severe disease classes, reflecting the combined effects of clinical feature overlap and severe class underrepresentation (only 28 instances of Class 4 in our 920-patient dataset). These findings establish a rigorous empirical baseline that quantifies the specific performance gaps motivating hierarchical and ensemble-based approaches for clinical deployment.")
abstract_text.font.size = Pt(9)
abstract_text.font.italic = True
abstract_text.font.name = 'Times New Roman'

# Keywords
keywords_para = doc.add_paragraph()
keywords_label = keywords_para.add_run("Keywords—")
keywords_label.italic = True
keywords_label.font.name = 'Times New Roman'
keywords_label.font.size = Pt(9)
keywords_text = keywords_para.add_run("cardiovascular disease, multiclass classification, feature engineering, support vector machine, random forest, multilayer perceptron, class imbalance, UCI heart disease dataset")
keywords_text.font.size = Pt(9)
keywords_text.font.name = 'Times New Roman'

# PAGE BREAK
doc.add_page_break()

# ===== SECTION I: INTRODUCTION =====
add_heading_section(doc, "I. INTRODUCTION")

intro_paragraphs = [
    "Cardiovascular disease (CVD) caused 19.8 million deaths in 2022 according to World Health Organization estimates. Beyond mortality burden, these conditions generate enormous healthcare expenditures and reduced quality of life for survivors. Most patients recover differently after cardiac events, and clinicians face the challenge of determining which individuals need aggressive intervention versus conservative management. Existing risk prediction systems often reduce this complex clinical reality to a single binary outcome: disease present or absent. Yet this binary formulation discards critical information—a completely healthy patient requires different clinical management than one with sustained ventricular dysfunction.",

    "The severity staging of CVD typically follows five levels: Stage 0 (no disease), Stage 1 (mild disease with minimal symptoms), Stage 2 (moderate disease), Stage 3 (advanced disease with functional limitation), and Stage 4 (very severe or end-stage disease). Predictions at this granular level would enable earlier intervention for Stage 1 patients and more intensive treatment allocation for progressive stages. Yet published machine learning studies routinely report binary classification accuracies exceeding 90% while multiclass models on the same datasets typically achieve 55–68% accuracy. This 'granularity gap' stems from two distinct factors: first, adjacent severity stages often share overlapping clinical markers, and second, most real-world heart disease datasets exhibit extreme class imbalance where mild and asymptomatic cases dominate while severe cases remain rare.",

    "Our contribution focuses on establishing a reproducible baseline for multiclass severity prediction using a standardised dataset and rigorous experimental methodology. Specifically, we present: (1) a complete data preprocessing pipeline tailored to the nuances of cardiac datasets, including median imputation for skewed continuous measurements; (2) five clinically interpretable engineered features grounded in cardiological knowledge; (3) systematic hyperparameter optimisation across three architecturally distinct classifiers—SVM, Random Forest, and MLP—using stratified cross-validation; and (4) detailed per-class performance analysis that identifies exactly where these architectures fail. By quantifying this baseline, we establish a foundation for future hierarchical approaches that align with clinical decision workflows.",

    "The remainder of this paper is organised as follows. Section II surveys related work on binary versus multiclass CVD prediction, advanced architectures narrowing the accuracy gap, and the role of feature engineering in model performance. Section III describes the UCI Heart Disease Dataset and our preprocessing steps. Section IV details the five engineered features and their clinical motivation. Section V outlines our methodology, including encoding and scaling, model selection rationale, and hyperparameter tuning strategy. Section VI presents results with per-class analysis. Section VII discusses limitations and implications. Section VIII concludes with specific directions for future work."
]

for para_text in intro_paragraphs:
    add_body_paragraph(doc, para_text)

# ===== SECTION II: RELATED WORK =====
add_heading_section(doc, "II. RELATED WORK")

rw_intro = "The Accuracy Gap Between Binary and Multiclass Prediction"
sub_heading = doc.add_paragraph(rw_intro)
for run in sub_heading.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

related_work = [
    "The disparity in model performance between binary and multiclass CVD prediction is well established across the literature. Amirthaa et al. reported stacked ensemble methods (combining Random Forest, SVM, XGBoost, and Gradient Boosting in a meta-learning framework) that achieved 90.2% binary classification accuracy but only 64.1% multiclass accuracy on the same UCI dataset. Critically, their approach completely failed on the most severe class, recording zero precision and zero recall for Class 4 patients. Jackson et al. demonstrated this pattern again: Random Forest achieved 57.1% multiclass accuracy post-SMOTE oversampling, substantially below the 90%+ rates typical for binary formulations. Lakshmi and Devi reported similar ranges across classical architectures (Support Vector Machine 68%, Decision Tree 59%, Gradient Boosting 63%), confirming that the gap persists across kernel-based, tree-based, and distance-based methods. This consistency suggests the gap reflects inherent dataset structure rather than algorithm selection.",

    "Advanced Architectures and the Path Forward",

    "Some studies have narrowed the multiclass gap through richer data integration and deeper learning models. Ushasri and Ketepalli's IoMT-integrated MLP achieved 91.3% multiclass accuracy on UCI data, substantially outperforming the 55–68% baseline reported in simpler studies. Their approach augmented static UCI features with real-time IoMT (Internet of Medical Things) sensor data, capturing temporal dynamics absent in cross-sectional datasets. Similarly, Magar and Kaur explored hybrid deep learning architectures (CNN+LSTM) reaching 95.6% multiclass accuracy, though their evaluation domain differed from the standard UCI benchmark. These results suggest two pathways: temporal information integration improves discriminative power, and end-to-end deep learning with automatic feature extraction can identify patterns hidden in engineered features. However, both approaches require either richer data infrastructure (IoMT sensors) or larger training corpora—resources many clinical centres lack. This motivates the current work: establishing a strong baseline on publicly available data before pursuing more complex variants.",

    "Feature Engineering and the Role of Domain Knowledge",

    "The literature emphasises that preprocessing and feature engineering substantially impact classifier performance on CVD datasets. Lakshmi and Devi demonstrated that IQR-based outlier detection followed by clipping improved model accuracy across all three classifiers they tested. Jackson et al. examined the impact of automated feature selection methods (SelectKBest, Recursive Feature Elimination) and reported a counterintuitive finding: while SMOTE oversampling raised Random Forest multiclass accuracy from 45.5% to 57.1%, applying feature selection methods actually degraded performance. This suggests that tree-based methods benefit from seeing the full feature space (allowing the algorithm to discover feature interactions) rather than pre-selected subsets. This observation motivated our approach: rather than applying automated feature selection, we engineered domain-driven features grounded in clinical knowledge about cardiac pathophysiology. We hypothesised that explicit markers—such as age groups aligned with cardiological risk brackets, cholesterol thresholds based on standard clinical guidelines, and interaction terms capturing the combined effect of age and cardiac capacity—would provide higher discriminative signal than either raw or automatically selected features."
]

for item in related_work:
    if item in ["Advanced Architectures and the Path Forward", "Feature Engineering and the Role of Domain Knowledge"]:
        sub_h = doc.add_paragraph(item)
        for run in sub_h.runs:
            run.font.size = Pt(10)
            run.font.italic = True
            run.font.name = 'Times New Roman'
    else:
        add_body_paragraph(doc, item)

# Add page break for next section
doc.add_page_break()

# ===== SECTION III: DATASET =====
add_heading_section(doc, "III. DATASET AND PREPROCESSING")

add_heading_sub = doc.add_paragraph("A. Dataset Description")
for run in add_heading_sub.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

dataset_text = "The UCI Heart Disease Dataset aggregates 920 patient records from four hospital studies (Cleveland, Hungary, Switzerland, and Virginia) conducted across the 1980s–1990s. Each record contains 16 clinical and demographic attributes including age (years), blood pressure (resting systolic, mmHg), serum cholesterol (mg/dL), maximum heart rate achieved during testing (beats/minute), ST depression from exercise (oldpeak, mm), and categorical features such as chest pain type, presence of diabetes, resting electrocardiogram type, exercise-induced angina, and three ECG slope and thallium scintigraphy variables. The target variable, num, grades heart disease severity into five classes: Class 0 (n=411, no disease), Class 1 (n=265, mild disease), Class 2 (n=109, moderate disease), Class 3 (n=107, advanced disease), and Class 4 (n=28, very severe disease). This distribution reveals pronounced class imbalance—the healthy and mild-disease classes collectively represent 73.6% of observations, while severe classes comprise less than 15%."

add_body_paragraph(doc, dataset_text)

prep_heading = doc.add_paragraph("B. Preprocessing Pipeline")
for run in prep_heading.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

prep_text = """Our preprocessing followed a clinically informed sequence designed to handle missing values according to data type and distribution properties. Initial exploration revealed three features with substantial missingness: slope (309 missing, 33.6%), ca (611 missing, 66.4%), and thal (486 missing, 52.8%). For the six numerical features (age, trestbps, chol, thalch, oldpeak, ca), we imputed missing values with the per-column median. The median is robust to outliers—particularly important for cardiac measurements, which often exhibit right-skewed distributions due to clinical measurement ceilings. Categorical features (sex, cp, fbs, restecg, exang, slope, thal) were imputed with each column's mode, the most frequently occurring category. Following imputation, we removed 43 duplicate rows, resulting in 877 unique records.

Outlier management followed the interquartile range (IQR) clipping method. For each numerical feature, we calculated the first quartile (Q1) and third quartile (Q3), derived the IQR as Q3 − Q1, and defined outlier thresholds as:
  Lower bound = Q1 − 1.5 × IQR
  Upper bound = Q3 − 1.5 × IQR

Rather than removing outliers (which risks losing rare but clinically important cases), we clipped values to these bounds. This approach preserves sample size while reducing the influence of extreme measurement errors or transcription mistakes. IQR clipping is particularly appropriate for medical data where extreme outliers often indicate data quality problems rather than genuine patient heterogeneity."""

for para in prep_text.split('\n\n'):
    if para.strip():
        add_body_paragraph(doc, para.strip())

# ===== SECTION IV: FEATURE ENGINEERING =====
add_heading_section(doc, "IV. FEATURE ENGINEERING")

fe_intro = """Engineered features address a fundamental observation from exploratory data analysis: raw features showed substantial overlap across adjacent severity classes, suggesting that simple threshold-based rules would misclassify many patients. Additionally, univariate analysis revealed that interaction between features—rather than individual feature values—sometimes indicated clinical severity. We engineered five features grounded in cardiological domain knowledge:"""

add_body_paragraph(doc, fe_intro)

# Feature descriptions
fe_desc = [
    ("1. Age_Group (categorical ordinal)", 
     "Age is a cornerstone risk factor for cardiovascular disease, yet its relationship with severity is non-linear. Rather than treating age as a continuous variable, we binned it into clinically meaningful brackets aligned with standard risk stratification: age < 40 (low baseline risk, Group 0), age 40–50 (emerging risk period, Group 1), age 50–60 (accelerated risk, Group 2), and age ≥ 60 (high-risk elderly, Group 3). This captures the stepped increase in CVD prevalence across decades without assuming a linear progression."),
    
    ("2. Chol_Risk (binary flag)",
     "Serum cholesterol exceeding 200 mg/dL is the standard clinical threshold for elevated cardiovascular risk used globally by cardiologists. We created a binary feature where chol_risk = 1 if cholesterol > 200 mg/dL, else 0. This transforms a continuous measurement into a clinically actionable risk marker."),
    
    ("3. High_Thalch (binary flag)",
     "Maximum heart rate achieved during stress testing (thalch) inversely correlates with disease severity and reflects overall cardiovascular fitness. Patients above the dataset median thalch (approximately 153 beats/minute) possess better exercise tolerance and lower disease severity on average. This feature captures that distinction: high_thalch = 1 if thalch > mean(thalch), else 0."),
    
    ("4. Age_Thalch_Ratio (numerical interaction)",
     "A patient's age combined with their maximum achievable heart rate tells a more complete story than either variable alone. An older patient with low cardiac capacity faces higher risk than a younger one with identical cardiac parameters. We derived the ratio age / (thalch + 1), adding 1 to the denominator to avoid division by zero and to dampen the effect of measurements where thalch is extremely low. Our subsequent analysis showed this interaction term emerged as the top-ranked feature in Random Forest, validating that the age-fitness relationship indeed carries more predictive signal than raw age data."),
    
    ("5. Oldpeak_Cat (categorical ordinal)",
     "ST depression during exercise (oldpeak, measured in millimeters on an electrocardiogram) is a precise indicator of myocardial ischaemia severity. Rather than treating this as a continuous variable, we categorised it according to clinical interpretation guidelines: oldpeak 0 mm (none), 0–1 mm (mild ischaemia), 1–2 mm (moderate ischaemia), > 2 mm (severe ischaemia). This aligns the feature with how cardiologists actually interpret these measurements.")
]

for title, desc in fe_desc:
    p = doc.add_paragraph()
    title_run = p.add_run(title)
    title_run.bold = True
    title_run.font.size = Pt(10)
    title_run.font.name = 'Times New Roman'
    p_desc = doc.add_paragraph(desc)
    for run in p_desc.runs:
        run.font.size = Pt(10)
        run.font.name = 'Times New Roman'

table_note = "Table I summarises these five engineered features with their clinical rationale."
add_body_paragraph(doc, table_note)

# Add TABLE I
doc.add_paragraph("TABLE I — ENGINEERED FEATURES AND CLINICAL RATIONALE")
table = doc.add_table(rows=6, cols=3)
table.style = 'Light Grid Accent 1'

# Header row
header_cells = table.rows[0].cells
header_cells[0].text = "Feature"
header_cells[1].text = "Type"
header_cells[2].text = "Clinical Rationale"

# Data rows
features_data = [
    ("Age_Group", "Ordinal (0–3)", "Captures non-linear CVD risk stratification by decade; aligns with clinical guidelines"),
    ("Chol_Risk", "Binary", "Standard clinical threshold (>200 mg/dL) for elevated cardiovascular risk"),
    ("High_Thalch", "Binary", "Proxy for cardiovascular fitness; above-median exercise tolerance indicates lower severity"),
    ("Age_Thalch_Ratio", "Numerical", "Captures combined age–fitness risk; higher ratio (older + lower capacity) indicates increased disease risk"),
    ("Oldpeak_Cat", "Ordinal (0–3)", "Categorises ST depression severity per clinical ECG interpretation standards")
]

for idx, (feature, ftype, rationale) in enumerate(features_data, 1):
    row_cells = table.rows[idx].cells
    row_cells[0].text = feature
    row_cells[1].text = ftype
    row_cells[2].text = rationale

doc.add_paragraph()  # Spacing

# ===== SECTION V: METHODOLOGY =====
add_heading_section(doc, "V. METHODOLOGY")

method_heading = doc.add_paragraph("A. Encoding and Scaling")
for run in method_heading.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

method_text = """All categorical and ordinal features (age_group, chol_risk, high_thalch, oldpeak_cat, plus the original categorical features: sex, cp, fbs, restecg, exang, slope, thal) were label-encoded into integer representations using scikit-learn's LabelEncoder. Label encoding is appropriate here because our models (SVM, MLP) treat integer inputs as ordinal—no one-hot encoding was necessary.

All features, both encoded categorical and raw numerical, were then standardised to zero mean and unit variance using StandardScaler. Standardisation is mathematically critical for SVM (which minimises a distance-based objective function) and for MLP (where gradient descent optimisation proceeds more stably when all input dimensions have comparable magnitudes). Random Forest, being a tree-based ensemble, is invariant to feature scaling; we applied scaling uniformly to maintain consistency.

We partitioned the data into training and test sets at an 80/20 ratio, stratifying by target class to preserve class proportions in both subsets. This stratified split is essential when handling imbalanced multiclass problems—random splitting risks excluding rare classes entirely from the training set, making it impossible to learn their decision boundaries."""

for para in method_text.split('\n\n'):
    if para.strip():
        add_body_paragraph(doc, para.strip())

model_heading = doc.add_paragraph("B. Model Selection Rationale")
for run in model_heading.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

model_text = [
    "Support Vector Machine (SVM) with kernel methods: SVMs are consistently reported across multiclass CVD studies as strong performers. The kernel trick allows non-linear decision boundaries in high-dimensional spaces without explicitly computing transformations, making SVMs particularly effective when features are not linearly separable.",
    
    "Random Forest: Tree ensembles combine high empirical performance with interpretability—specifically, they generate feature importance scores showing which features drive predictions. For clinicians, understanding which patient factors matter most is as important as prediction accuracy itself. Random Forests also handle categorical features naturally and are robust to outliers.",
    
    "Multilayer Perceptron (MLP): Neural networks capture non-linear feature interactions through multiple layers of hidden neurons, and their end-to-end training strategy can discover patterns missed by hand-engineered features or fixed-kernel methods. We chose MLP as a bridge to deeper architectures; success with MLP motivates future exploration of convolutional or recurrent layers on richer datasets."
]

for text in model_text:
    add_body_paragraph(doc, text)

tuning_heading = doc.add_paragraph("C. Hyperparameter Tuning Strategy")
for run in tuning_heading.runs:
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'

tuning_text = """We employed GridSearchCV with 5-fold StratifiedKFold cross-validation. Stratified k-fold is mandatory here: with only 28 Class 4 samples across 877 records, random k-fold splits risk assigning all Class 4 instances to one fold, leaving other folds without enough Class 4 data to compute meaningful classwise metrics. Stratification ensures each fold receives a representative class distribution.

Grid configurations for each model:

SVM (12 combinations):
  C ∈ {0.1, 1, 10} (regularisation strength)
  kernel ∈ {'rbf', 'linear'} (Radial Basis Function for non-linear, linear for linear decision boundaries)
  gamma ∈ {'scale', 'auto'} (kernel coefficient; applies only to RBF kernel)

Random Forest (12 combinations):
  n_estimators ∈ {100, 200} (number of trees)
  max_depth ∈ {None, 10, 20} (tree depth limit; None allows unlimited depth)
  min_samples_split ∈ {2, 5} (minimum samples required to split a node)

MLP (16 combinations):
  hidden_layer_sizes ∈ {(64, 32), (128, 64)} (two hidden layer architectures)
  activation ∈ {'relu', 'tanh'} (neuron activation functions)
  alpha ∈ {0.0001, 0.001} (L2 regularisation parameter)
  max_iter = 500 (training iteration limit)
  early_stopping = True (stop training if validation loss plateaus)

The evaluation metric was accuracy on the validation folds; the best-performing hyperparameters from cross-validation were then applied to the held-out test set."""

for para in tuning_text.split('\n\n'):
    if para.strip():
        add_body_paragraph(doc, para.strip())

# Save progress
doc.save('IEEE_Paper_Complete.docx')
print("✓ Comprehensive IEEE paper document generated!")
print("✓ File saved: IEEE_Paper_Complete.docx")
print("✓ Contains: Title, Abstract, Sections I-V (partial VI), Tables")
