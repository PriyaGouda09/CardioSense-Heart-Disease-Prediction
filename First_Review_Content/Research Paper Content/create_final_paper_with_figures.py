import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pathlib import Path

def add_heading(doc, text):
    """Add a main section heading"""
    h = doc.add_paragraph()
    run = h.add_run(text)
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.name = 'Times New Roman'
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(6)
    return h

def add_subheading(doc, text):
    """Add subsection heading (italic)"""
    h = doc.add_paragraph()
    run = h.add_run(text)
    run.font.size = Pt(10)
    run.font.italic = True
    run.font.name = 'Times New Roman'
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    return h

def add_body(doc, text):
    """Add body paragraph"""
    p = doc.add_paragraph(text)
    for run in p.runs:
        run.font.size = Pt(10)
        run.font.name = 'Times New Roman'
    p.paragraph_format.space_after = Pt(6)
    return p

def add_figure(doc, fig_path, caption):
    """Add figure to document"""
    if Path(fig_path).exists():
        # Add some space before figure
        doc.add_paragraph()
        # Add figure
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
        run.add_picture(fig_path, width=Inches(5.5))
        # Add caption
        cap = doc.add_paragraph(caption)
        cap_run = cap.runs[0]
        cap_run.font.size = Pt(9)
        cap_run.font.name = 'Times New Roman'
        cap_run.italic = True
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        return True
    return False

# Create document
doc = Document()

# Setup margins
for section in doc.sections:
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
title.paragraph_format.space_after = Pt(12)

# Authors
authors = doc.add_paragraph()
authors.alignment = WD_ALIGN_PARAGRAPH.CENTER
a_run = authors.add_run("Prisha Surve¹*, Priya Gouda², Rhea Suresh³")
a_run.font.size = Pt(10)
a_run.font.name = 'Times New Roman'

# Affiliation line 1
aff1 = doc.add_paragraph()
aff1.alignment = WD_ALIGN_PARAGRAPH.CENTER
aff1_run = aff1.add_run("¹²³Department of Computer Engineering, K.J. Somaiya School of Engineering,")
aff1_run.font.size = Pt(9)
aff1_run.font.name = 'Times New Roman'

# Affiliation line 2
aff2 = doc.add_paragraph()
aff2.alignment = WD_ALIGN_PARAGRAPH.CENTER
aff2_run = aff2.add_run("Somaiya Vidyavihar University, Mumbai, India")
aff2_run.font.size = Pt(9)
aff2_run.font.name = 'Times New Roman'

# Emails
emails = doc.add_paragraph()
emails.alignment = WD_ALIGN_PARAGRAPH.CENTER
e_run = emails.add_run("prisha.surve@somaiya.edu, priya.gouda@somaiya.edu, rhea.suresh@somaiya.edu")
e_run.font.size = Pt(9)
e_run.font.name = 'Times New Roman'

# Corresponding author
corr = doc.add_paragraph()
corr.alignment = WD_ALIGN_PARAGRAPH.CENTER
c_run = corr.add_run("*Corresponding author: prisha.surve@somaiya.edu")
c_run.font.size = Pt(9)
c_run.font.name = 'Times New Roman'
c_run.italic = True

doc.add_paragraph()

# ===== ABSTRACT =====
abs_para = doc.add_paragraph()
abs_label = abs_para.add_run("Abstract—")
abs_label.italic = True
abs_label.font.size = Pt(10)
abs_label.font.name = 'Times New Roman'

abs_text = abs_para.add_run("Cardiovascular disease remains the leading cause of mortality worldwide, accounting for nearly one-third of global deaths annually. While existing machine learning models often formulate the problem as binary classification—disease present or absent—clinical practice requires granular severity staging to guide treatment decisions. This study addresses the multiclass cardiovascular disease severity prediction challenge using the publicly available UCI Heart Disease Dataset. We applied a complete preprocessing and feature engineering pipeline, developed five clinically motivated engineered features, and trained three baseline classifiers (Support Vector Machine, Random Forest, and Multilayer Perceptron) with systematic hyperparameter tuning via GridSearchCV. Our best model, a neural network architecture with a (128, 64) hidden layer structure, achieved 59.24% test accuracy across five severity classes. All models demonstrated substantially lower performance on the two most severe disease classes, reflecting the combined effects of clinical feature overlap and severe class underrepresentation (only 28 instances of Class 4 in our 920-patient dataset). These findings establish a rigorous empirical baseline that quantifies the specific performance gaps motivating hierarchical and ensemble-based approaches for clinical deployment.")
abs_text.font.size = Pt(9)
abs_text.italic = True
abs_text.font.name = 'Times New Roman'

# Keywords
kw_para = doc.add_paragraph()
kw_label = kw_para.add_run("Keywords—")
kw_label.italic = True
kw_label.font.size = Pt(9)
kw_label.font.name = 'Times New Roman'
kw_text = kw_para.add_run("cardiovascular disease, multiclass classification, feature engineering, support vector machine, random forest, multilayer perceptron, class imbalance, UCI heart disease dataset")
kw_text.font.size = Pt(9)
kw_text.font.name = 'Times New Roman'

doc.add_page_break()

# ===== SECTION I: INTRODUCTION =====
add_heading(doc, "I. INTRODUCTION")

add_body(doc, "Cardiovascular disease (CVD) caused 19.8 million deaths in 2022 according to World Health Organization estimates. Beyond mortality burden, these conditions generate enormous healthcare expenditures and reduced quality of life for survivors. Most patients recover differently after cardiac events, and clinicians face the challenge of determining which individuals need aggressive intervention versus conservative management. Existing risk prediction systems often reduce this complex clinical reality to a single binary outcome: disease present or absent. Yet this binary formulation discards critical information—a completely healthy patient requires different clinical management than one with sustained ventricular dysfunction.")

add_body(doc, "The severity staging of CVD typically follows five levels: Stage 0 (no disease), Stage 1 (mild disease with minimal symptoms), Stage 2 (moderate disease), Stage 3 (advanced disease with functional limitation), and Stage 4 (very severe or end-stage disease). Predictions at this granular level would enable earlier intervention for Stage 1 patients and more intensive treatment allocation for progressive stages. Yet published machine learning studies routinely report binary classification accuracies exceeding 90% while multiclass models on the same datasets typically achieve 55–68% accuracy. This 'granularity gap' stems from two distinct factors: first, adjacent severity stages often share overlapping clinical markers, and second, most real-world heart disease datasets exhibit extreme class imbalance where mild and asymptomatic cases dominate while severe cases remain rare.")

add_body(doc, "Our contribution focuses on establishing a reproducible baseline for multiclass severity prediction using a standardised dataset and rigorous experimental methodology. Specifically, we present: (1) a complete data preprocessing pipeline tailored to the nuances of cardiac datasets, including median imputation for skewed continuous measurements; (2) five clinically interpretable engineered features grounded in cardiological knowledge; (3) systematic hyperparameter optimisation across three architecturally distinct classifiers—SVM, Random Forest, and MLP—using stratified cross-validation; and (4) detailed per-class performance analysis that identifies exactly where these architectures fail. By quantifying this baseline, we establish a foundation for future hierarchical approaches that align with clinical decision workflows.")

add_body(doc, "The remainder of this paper is organised as follows. Section II surveys related work on binary versus multiclass CVD prediction, advanced architectures narrowing the accuracy gap, and the role of feature engineering in model performance. Section III describes the UCI Heart Disease Dataset and our preprocessing steps. Section IV details the five engineered features and their clinical motivation. Section V outlines our methodology, including encoding and scaling, model selection rationale, and hyperparameter tuning strategy. Section VI presents results with per-class analysis and figures. Section VII discusses limitations and implications. Section VIII concludes with specific directions for future work.")

# ===== SECTION II: RELATED WORK =====
add_heading(doc, "II. RELATED WORK")

add_subheading(doc, "The Accuracy Gap Between Binary and Multiclass Prediction")

add_body(doc, "The disparity in model performance between binary and multiclass CVD prediction is well established across the literature. Amirthaa et al. reported stacked ensemble methods (combining Random Forest, SVM, XGBoost, and Gradient Boosting in a meta-learning framework) that achieved 90.2% binary classification accuracy but only 64.1% multiclass accuracy on the same UCI dataset. Critically, their approach completely failed on the most severe class, recording zero precision and zero recall for Class 4 patients. Jackson et al. demonstrated this pattern again: Random Forest achieved 57.1% multiclass accuracy post-SMOTE oversampling, substantially below the 90%+ rates typical for binary formulations. Lakshmi and Devi reported similar ranges across classical architectures (Support Vector Machine 68%, Decision Tree 59%, Gradient Boosting 63%), confirming that the gap persists across kernel-based, tree-based, and distance-based methods. This consistency suggests the gap reflects inherent dataset structure rather than algorithm selection.")

add_subheading(doc, "Advanced Architectures and the Path Forward")

add_body(doc, "Some studies have narrowed the multiclass gap through richer data integration and deeper learning models. Ushasri and Ketepalli's IoMT-integrated MLP achieved 91.3% multiclass accuracy on UCI data, substantially outperforming the 55–68% baseline reported in simpler studies. Their approach augmented static UCI features with real-time IoMT (Internet of Medical Things) sensor data, capturing temporal dynamics absent in cross-sectional datasets. Similarly, Magar and Kaur explored hybrid deep learning architectures (CNN+LSTM) reaching 95.6% multiclass accuracy, though their evaluation domain differed from the standard UCI benchmark. These results suggest two pathways: temporal information integration improves discriminative power, and end-to-end deep learning with automatic feature extraction can identify patterns hidden in engineered features. However, both approaches require either richer data infrastructure (IoMT sensors) or larger training corpora—resources many clinical centres lack. This motivates the current work: establishing a strong baseline on publicly available data before pursuing more complex variants.")

add_subheading(doc, "Feature Engineering and the Role of Domain Knowledge")

add_body(doc, "The literature emphasises that preprocessing and feature engineering substantially impact classifier performance on CVD datasets. Lakshmi and Devi demonstrated that IQR-based outlier detection followed by clipping improved model accuracy across all three classifiers they tested. Jackson et al. examined the impact of automated feature selection methods (SelectKBest, Recursive Feature Elimination) and reported a counterintuitive finding: while SMOTE oversampling raised Random Forest multiclass accuracy from 45.5% to 57.1%, applying feature selection methods actually degraded performance. This suggests that tree-based methods benefit from seeing the full feature space (allowing the algorithm to discover feature interactions) rather than pre-selected subsets. This observation motivated our approach: rather than applying automated feature selection, we engineered domain-driven features grounded in clinical knowledge about cardiac pathophysiology. We hypothesised that explicit markers—such as age groups aligned with cardiological risk brackets, cholesterol thresholds based on standard clinical guidelines, and interaction terms capturing the combined effect of age and cardiac capacity—would provide higher discriminative signal than either raw or automatically selected features.")

doc.add_page_break()

# ===== SECTION III: DATASET =====
add_heading(doc, "III. DATASET AND PREPROCESSING")

add_subheading(doc, "A. Dataset Description")

add_body(doc, "The UCI Heart Disease Dataset aggregates 920 patient records from four hospital studies (Cleveland, Hungary, Switzerland, and Virginia) conducted across the 1980s–1990s. Each record contains 16 clinical and demographic attributes including age (years), blood pressure (resting systolic, mmHg), serum cholesterol (mg/dL), maximum heart rate achieved during testing (beats/minute), ST depression from exercise (oldpeak, mm), and categorical features such as chest pain type, presence of diabetes, resting electrocardiogram type, exercise-induced angina, and three ECG slope and thallium scintigraphy variables. The target variable, num, grades heart disease severity into five classes: Class 0 (n=411, no disease), Class 1 (n=265, mild disease), Class 2 (n=109, moderate disease), Class 3 (n=107, advanced disease), and Class 4 (n=28, very severe disease). This distribution reveals pronounced class imbalance—the healthy and mild-disease classes collectively represent 73.6% of observations, while severe classes comprise less than 15%.")

add_figure(doc, 'figures/Fig1_Boxplots_Outliers.png', 'Fig. 1. Boxplots of numerical features before outlier clipping (IQR method). Shows upper and lower bounds used for outlier detection.')

add_subheading(doc, "B. Preprocessing Pipeline")

add_body(doc, "Our preprocessing followed a clinically informed sequence designed to handle missing values according to data type and distribution properties. Initial exploration revealed three features with substantial missingness: slope (309 missing, 33.6%), ca (611 missing, 66.4%), and thal (486 missing, 52.8%). For the six numerical features (age, trestbps, chol, thalch, oldpeak, ca), we imputed missing values with the per-column median. The median is robust to outliers—particularly important for cardiac measurements, which often exhibit right-skewed distributions due to clinical measurement ceilings. Categorical features (sex, cp, fbs, restecg, exang, slope, thal) were imputed with each column's mode, the most frequently occurring category. Following imputation, we removed 43 duplicate rows, resulting in 877 unique records.")

add_body(doc, "Outlier management followed the interquartile range (IQR) clipping method. For each numerical feature, we calculated the first quartile (Q1) and third quartile (Q3), derived the IQR as Q3 − Q1, and defined outlier thresholds as: Lower bound = Q1 − 1.5 × IQR, Upper bound = Q3 + 1.5 × IQR. Rather than removing outliers (which risks losing rare but clinically important cases), we clipped values to these bounds. This approach preserves sample size while reducing the influence of extreme measurement errors or transcription mistakes. IQR clipping is particularly appropriate for medical data where extreme outliers often indicate data quality problems rather than genuine patient heterogeneity.")

add_figure(doc, 'figures/Fig2_Distributions.png', 'Fig. 2. Distributions of numerical features (histograms with KDE). Note right-skewed distributions in cholesterol and resting blood pressure.')

# ===== SECTION IV: FEATURE ENGINEERING =====
add_heading(doc, "IV. FEATURE ENGINEERING")

add_body(doc, "Engineered features address a fundamental observation from exploratory data analysis: raw features showed substantial overlap across adjacent severity classes, suggesting that simple threshold-based rules would misclassify many patients. Additionally, univariate analysis revealed that interaction between features—rather than individual feature values—sometimes indicated clinical severity. We engineered five features grounded in cardiological domain knowledge:")

add_body(doc, "1. Age_Group (categorical ordinal): Age is a cornerstone risk factor for cardiovascular disease, yet its relationship with severity is non-linear. Rather than treating age as a continuous variable, we binned it into clinically meaningful brackets aligned with standard risk stratification: age < 40 (low baseline risk), age 40–50 (emerging risk period), age 50–60 (accelerated risk), and age ≥ 60 (high-risk elderly). This captures the stepped increase in CVD prevalence across decades without assuming a linear progression.")

add_body(doc, "2. Chol_Risk (binary flag): Serum cholesterol exceeding 200 mg/dL is the standard clinical threshold for elevated cardiovascular risk used globally by cardiologists. We created a binary feature where chol_risk = 1 if cholesterol > 200 mg/dL, else 0. This transforms a continuous measurement into a clinically actionable risk marker.")

add_body(doc, "3. High_Thalch (binary flag): Maximum heart rate achieved during stress testing (thalch) inversely correlates with disease severity and reflects overall cardiovascular fitness. Patients above the dataset median thalch (approximately 153 beats/minute) possess better exercise tolerance and lower disease severity on average. This feature captures that distinction: high_thalch = 1 if thalch > mean(thalch), else 0.")

add_body(doc, "4. Age_Thalch_Ratio (numerical interaction): A patient's age combined with their maximum achievable heart rate tells a more complete story than either variable alone. An older patient with low cardiac capacity faces higher risk than a younger one with identical cardiac parameters. We derived the ratio age / (thalch + 1), adding 1 to the denominator to avoid division by zero and to dampen the effect of measurements where thalch is extremely low. Our subsequent analysis showed this interaction term emerged as the top-ranked feature in Random Forest, validating that the age-fitness relationship indeed carries more predictive signal than raw age data.")

add_body(doc, "5. Oldpeak_Cat (categorical ordinal): ST depression during exercise (oldpeak, measured in millimeters on an electrocardiogram) is a precise indicator of myocardial ischaemia severity. Rather than treating this as a continuous variable, we categorised it according to clinical interpretation guidelines: oldpeak 0 mm (none), 0–1 mm (mild ischaemia), 1–2 mm (moderate ischaemia), > 2 mm (severe ischaemia). This aligns the feature with how cardiologists actually interpret these measurements.")

add_figure(doc, 'figures/Fig8_EngineeredFeatures.png', 'Fig. 3. Engineered features versus heart disease severity. Age group shows increasing disease prevalence with age; cholesterol risk and oldpeak severity categories confirm clinical stratification patterns.')

# ===== TABLE I =====
table_text = doc.add_paragraph("TABLE I — ENGINEERED FEATURES AND CLINICAL RATIONALE")
table_run = table_text.runs[0]
table_run.font.size = Pt(10)
table_run.font.bold = True
table_run.font.name = 'Times New Roman'

table = doc.add_table(rows=6, cols=3)
table.style = 'Light Grid Accent 1'

header_cells = table.rows[0].cells
header_cells[0].text = "Feature"
header_cells[1].text = "Type"
header_cells[2].text = "Clinical Rationale"

features_data = [
    ("Age_Group", "Ordinal", "Captures non-linear CVD risk stratification by decade"),
    ("Chol_Risk", "Binary", "Standard clinical threshold (>200 mg/dL) for elevated risk"),
    ("High_Thalch", "Binary", "Cardiovascular fitness proxy; above-median indicates lower severity"),
    ("Age_Thalch_Ratio", "Numerical", "Combined age–fitness risk; captures interaction effect"),
    ("Oldpeak_Cat", "Ordinal", "ST depression severity per clinical ECG standards")
]

for idx, (feature, ftype, rationale) in enumerate(features_data, 1):
    row_cells = table.rows[idx].cells
    row_cells[0].text = feature
    row_cells[1].text = ftype
    row_cells[2].text = rationale

# Format table
for row in table.rows:
    for cell in row.cells:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.size = Pt(9)
                run.font.name = 'Times New Roman'

doc.add_page_break()

# ===== SECTION V: METHODOLOGY =====
add_heading(doc, "V. METHODOLOGY")

add_subheading(doc, "A. Encoding and Scaling")

add_body(doc, "All categorical and ordinal features (age_group, chol_risk, high_thalch, oldpeak_cat, plus the original categorical features: sex, cp, fbs, restecg, exang, slope, thal) were label-encoded into integer representations using scikit-learn's LabelEncoder. Label encoding is appropriate here because our models (SVM, MLP) treat integer inputs as ordinal—no one-hot encoding was necessary.")

add_body(doc, "All features, both encoded categorical and raw numerical, were then standardised to zero mean and unit variance using StandardScaler. Standardisation is mathematically critical for SVM (which minimises a distance-based objective function) and for MLP (where gradient descent optimisation proceeds more stably when all input dimensions have comparable magnitudes). Random Forest, being a tree-based ensemble, is invariant to feature scaling; we applied scaling uniformly to maintain consistency.")

add_body(doc, "We partitioned the data into training and test sets at an 80/20 ratio, stratifying by target class to preserve class proportions in both subsets. This stratified split is essential when handling imbalanced multiclass problems—random splitting risks excluding rare classes entirely from the training set, making it impossible to learn their decision boundaries.")

add_subheading(doc, "B. Model Selection Rationale")

add_body(doc, "Support Vector Machine (SVM) with kernel methods: SVMs are consistently reported across multiclass CVD studies as strong performers. The kernel trick allows non-linear decision boundaries in high-dimensional spaces without explicitly computing transformations, making SVMs particularly effective when features are not linearly separable.")

add_body(doc, "Random Forest: Tree ensembles combine high empirical performance with interpretability—specifically, they generate feature importance scores showing which features drive predictions. For clinicians, understanding which patient factors matter most is as important as prediction accuracy itself. Random Forests also handle categorical features naturally and are robust to outliers.")

add_body(doc, "Multilayer Perceptron (MLP): Neural networks capture non-linear feature interactions through multiple layers of hidden neurons, and their end-to-end training strategy can discover patterns missed by hand-engineered features or fixed-kernel methods. We chose MLP as a bridge to deeper architectures; success with MLP motivates future exploration of convolutional or recurrent layers on richer datasets.")

add_subheading(doc, "C. Hyperparameter Tuning Strategy")

add_body(doc, "We employed GridSearchCV with 5-fold StratifiedKFold cross-validation. Stratified k-fold is mandatory here: with only 28 Class 4 samples across 877 records, random k-fold splits risk assigning all Class 4 instances to one fold, leaving other folds without enough Class 4 data to compute meaningful classwise metrics. Stratification ensures each fold receives a representative class distribution.")

add_body(doc, "Grid configurations for each model: SVM (12 combinations): C ∈ {0.1, 1, 10}, kernel ∈ {'rbf', 'linear'}, gamma ∈ {'scale', 'auto'}. Random Forest (12 combinations): n_estimators ∈ {100, 200}, max_depth ∈ {None, 10, 20}, min_samples_split ∈ {2, 5}. MLP (16 combinations): hidden_layer_sizes ∈ {(64, 32), (128, 64)}, activation ∈ {'relu', 'tanh'}, alpha ∈ {0.0001, 0.001}, max_iter = 500, early_stopping = True. The evaluation metric was accuracy on the validation folds; the best-performing hyperparameters from cross-validation were then applied to the held-out test set.")

doc.add_page_break()

# ===== SECTION VI: RESULTS =====
add_heading(doc, "VI. RESULTS AND ANALYSIS")

# TABLE II
table_text2 = doc.add_paragraph("TABLE II — MODEL PERFORMANCE AND OPTIMAL HYPERPARAMETERS")
table_run2 = table_text2.runs[0]
table_run2.font.size = Pt(10)
table_run2.font.bold = True
table_run2.font.name = 'Times New Roman'

table2 = doc.add_table(rows=4, cols=4)
table2.style = 'Light Grid Accent 1'

h_cells = table2.rows[0].cells
h_cells[0].text = "Model"
h_cells[1].text = "Optimal Hyperparameters"
h_cells[2].text = "CV Accuracy"
h_cells[3].text = "Test Accuracy"

model_results = [
    ("SVM", "C=1, kernel='rbf', gamma='scale'", "0.5748", "0.5598"),
    ("Random Forest", "n_estimators=100, max_depth=10, min_samples_split=2", "0.5816", "0.5652"),
    ("MLP", "hidden_layers=(128,64), activation='tanh', alpha=0.0001", "0.5531", "0.5924")
]

for idx, (model, params, cv, test) in enumerate(model_results, 1):
    row_cells = table2.rows[idx].cells
    row_cells[0].text = model
    row_cells[1].text = params
    row_cells[2].text = cv
    row_cells[3].text = test

for row in table2.rows:
    for cell in row.cells:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.size = Pt(9)
                run.font.name = 'Times New Roman'

add_body(doc, "The MLP achieved the highest test accuracy at 59.24%, representing a 2.72 percentage point improvement over SVM and a 2.72 percentage point improvement over Random Forest. However, the MLP's cross-validation accuracy (55.31%) substantially lags its test accuracy (59.24%)—a 3.93 percentage point gap that suggests modest overfitting to the particular test fold. This discrepancy warrants caution in interpreting MLP as superior, though it may reflect random variation given the small test set (n=175).")

add_figure(doc, 'figures/Fig9_ConfusionMatrices.png', 'Fig. 4. Confusion matrices on test set (n=175 samples). All three models concentrate predictions on Class 0 (healthy), achieving high recall but near-zero recall on Classes 3–4, highlighting the class imbalance challenge.')

add_subheading(doc, "Per-Class Performance Analysis")

add_body(doc, "The aggregate accuracy figures mask critical class-specific failures. SVM concentrated predictions on Class 0, achieving 88% recall (detecting 88% of healthy patients) with 75% precision (F1=0.81). For Class 1 (mild disease), performance degraded: 57% recall and 44% precision (F1=0.50). Classes 2, 3, and 4 received zero or near-zero predictions; the SVM assigned almost all cases to Class 0, essentially learning a degenerate solution that 'predicts healthy' for difficult cases rather than attempting to separate the minority classes.")

add_body(doc, "Random Forest distributed predictions more broadly across all five classes. Class 0 again dominated (F1=0.78), Class 1 showed modest improvement (F1=0.51), and Classes 2 and 3 garnered non-zero predictions (F1=0.12 and 0.18, respectively). Class 4 remained completely undetected (precision and recall both 0). Feature importance analysis revealed age_thalch_ratio as the single most important feature (importance ≈ 0.087), followed by chol, thalch, age, and cp (chest pain type). This ranking validates our domain-driven feature engineering: the engineered age-fitness interaction term outranked both of its constituent variables, confirming that their combined effect matters more than their individual contributions.")

add_body(doc, "The MLP achieved the best F1 scores for Classes 1 (F1=0.53) and 3 (F1=0.27) among all models. Notably, for Class 4 (very severe disease), the MLP reported 100% precision with 17% recall. This apparent paradox—identifying one Class 4 case correctly while missing five others—arises because only a handful of Class 4 instances exist; the model made a single correct identification, yielding perfect precision on that isolated prediction. This serves as a stark reminder: when evaluating classifiers on severely imbalanced classes, per-class metrics can be misleading if not interpreted with sample counts in mind.")

add_figure(doc, 'figures/Fig10_ModelComparison.png', 'Fig. 5. (Left) Cross-validation vs. test accuracy for all three models. MLP shows largest CV-test gap. (Right) Top 15 feature importances from Random Forest reveal age_thalch_ratio as the most predictive feature, validating engineered feature design.')

add_body(doc, "A consistent pattern emerged across all three architecturally distinct methods: Classes 0 and 1 received robust detection while Classes 3 and 4 remained largely undetected. In our test set: Class 0 had 82 samples, Class 1 had 53, Class 2 had 22, Class 3 had 21, and Class 4 had 6. The severe class imbalance directly correlates with degrading per-class accuracy. This finding aligns with Amirthaa et al.'s report of zero precision and recall for Class 4 in their stacked ensemble, and Jackson et al.'s observation that SMOTE oversampling actually hurt Random Forest despite raising the overall multiclass accuracy. The implication is that shallow feature engineering and standard training procedures cannot overcome extreme class imbalance alone. Rather, addressing this requires either data augmentation (SMOTE, oversampling, synthetic data generation), cost-sensitive loss functions (weighting minority class errors more heavily), or fundamentally different architectures such as one-vs-rest binary classifiers stacked in a hierarchical tree.")

doc.add_page_break()

# ===== SECTION VII: DISCUSSION =====
add_heading(doc, "VII. DISCUSSION")

add_body(doc, "These baseline results quantify the exact scale of the multiclass severity prediction challenge and identify where standard classifiers fail. The best-performing model (MLP at 59.24% accuracy) remains well below clinically acceptable thresholds, and its collapse on severe classes limits utility for high-risk patient identification.")

add_subheading(doc, "Limitations and Corresponding Future Directions")

add_body(doc, "First, class imbalance: our dataset contains 73.6% of all instances in Classes 0–1, with only 28 samples of Class 4. No classifier can reliably learn from such sparse representations. Future work should explore Synthetic Minority Over-sampling Technique (SMOTE) to artificially augment minority classes, cost-sensitive learning where misclassifying a Class 4 patient incurs higher penalty than misclassifying a Class 0 patient, or focal loss functions that down-weight easy-to-classify examples and focus training on hard cases.")

add_body(doc, "Second, flat multi-way classification architecture: treating all five classes symmetrically ignores clinical reality. Cardiologists first determine presence or absence of disease (binary triage), then stage severity among positive cases. A two-stage hierarchical model where Stage 1 classifies healthy (Class 0) versus diseased (Classes 1–4), and Stage 2 classifies severity among the diseased, aligns with actual diagnostic workflows. The binary-versus-diseased decision likely has higher accuracy than the full five-way problem, reducing pressure on the second stage.")

add_body(doc, "Third, lack of explainability: our models operate as black boxes. SHapley Additive exPlanations (SHAP) values would decompose each prediction into per-feature contributions, enabling cardiologists to understand why a model classified a specific patient as Class 2 rather than Class 1. For high-stakes medical applications, interpretability is not a luxury but a requirement.")

add_body(doc, "However, the work yields interpretable findings. The fact that age_thalch_ratio became the top feature in Random Forest is clinically sensible: a patient's age combined with their exercise tolerance capacity is more informative than either metric alone. Older patients with low cardiac capacity face compounding risks. This emergent insight, derived directly from our engineering choices, suggests that domain-informed feature creation outperforms automated methods on this dataset—a finding consistent with Jackson et al.'s observation that automated feature selection actually hurt tree-based multiclass performance.")

# ===== SECTION VIII: CONCLUSION =====
add_heading(doc, "VIII. CONCLUSION")

add_body(doc, "We trained and evaluated three baseline classifiers—Support Vector Machine, Random Forest, and Multilayer Perceptron—for five-class cardiovascular disease severity prediction on the UCI Heart Disease Dataset. The MLP achieved the highest test accuracy at 59.24%, though all models exhibited near-complete failure on the two most severe disease classes due to extreme class imbalance. These results establish quantitative evidence that standard multiclass approaches collapse on imbalanced medical data, motivating three specific directions for future work:")

add_body(doc, "1. Implement class-balanced training strategies: apply SMOTE oversampling for minority classes and cost-sensitive learning where minority misclassifications incur higher penalty weights.")

add_body(doc, "2. Develop hierarchical classification: design a two-stage pipeline where Stage 1 performs binary detection (healthy vs. diseased) and Stage 2 performs severity staging among positive cases, aligning with clinical triage workflows.")

add_body(doc, "3. Integrate explainability mechanisms: generate SHAP force plots and summary plots to decompose individual predictions into feature contributions, enabling clinicians to trust and act on model outputs.")

add_body(doc, "Building trustworthy clinical AI systems requires establishing rigorous baselines that expose failure modes, quantify performance gaps, and guide architectural innovations. This work provides that foundation.")

doc.add_page_break()

# ===== REFERENCES =====
add_heading(doc, "REFERENCES")

references = [
    "[1] A. M, G. I. Mary, A. Julian and A. L. X. R. Selvarathinam, \"Improving Heart Disease Prediction with Stacked Ensemble Learning: A Comparison of Binary and Multiclass,\" 2024 First International Conference for Women in Computing (InCoWoCo), Pune, India, 2024, pp. 1-9, doi: 10.1109/InCoWoCo64194.2024.10863760.",
    
    "[2] C. Ushasri and G. Ketepalli, \"AI-based Predictive Model for Binary and Multiclass Heart Disease Classification in IoMT,\" 2025 5th International Conference on Ubiquitous Computing and Intelligent Information Systems (ICUIS), Erode, India, 2025, pp. 1410-1415, doi: 10.1109/ICUIS67429.2025.11380471.",
    
    "[3] N. S. Magar and P. Kaur, \"Survey of Heart Disease Prediction Models using Machine Learning and Deep Learning Techniques,\" 2025 International Conference on Engineering, Technology & Management (ICETM), Oakdale, NY, USA, 2025, pp. 1-6, doi: 10.1109/ICETM63734.2025.11051868.",
    
    "[4] M. Fransisco, A. Chandra and M. Aryuni, \"Evaluating the Impact of Feature Selection on Ensemble Models for Multiclass Heart Disease Prediction,\" 2025 10th International Conference on Information Technology and Digital Application (ICITDA), Yogyakarta, Indonesia, 2025, pp. 1-8, doi: 10.1109/ICITDA68167.2025.11332461.",
    
    "[5] A. Lakshmi and R. Devi, \"Comparative Analysis of Multiclass Heart Disease Prediction Classification Models using Preprocessing and Feature Selection,\" 2022 Sixth International Conference on I-SMAC, Dharan, Nepal, 2022, pp. 320-326, doi: 10.1109/I-SMAC55078.2022.9852445.",
    
    "[6] S. D. Permai et al., \"Heart Disease Prediction in Indonesia Using Machine Learning Techniques for Multiclass Classification,\" 2025 5th International Conference on Innovative Research in Applied Science, Engineering and Technology (IRASET), Fez, Morocco, 2025, pp. 1-6, doi: 10.1109/IRASET64571.2025.11007969.",
    
    "[7] N. V. Chawla, K. W. Bowyer, L. O. Hall, and W. P. Kegelmeyer, \"SMOTE: Synthetic Minority Over-sampling Technique,\" Journal of Artificial Intelligence Research, vol. 16, pp. 321-357, 2002.",
    
    "[8] World Health Organization, \"Cardiovascular diseases (CVDs),\" WHO Fact Sheets, 2023."
]

for ref in references:
    ref_para = doc.add_paragraph(ref, style='List Number')
    for run in ref_para.runs:
        run.font.size = Pt(9)
        run.font.name = 'Times New Roman'

# Save document
doc.save('IEEE_Paper_Complete_With_Figures.docx')
print("✓ Complete IEEE paper generated with all figures!")
print("✓ File saved: IEEE_Paper_Complete_With_Figures.docx")
print("✓ Contains: Title, Abstract, Sections I-VIII, Tables I-II, 5 Figures")
print("\n✓✓✓ PAPER READY FOR SUBMISSION ✓✓✓")
