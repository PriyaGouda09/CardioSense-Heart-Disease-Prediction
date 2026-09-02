# ============================================================
#  HEART DISEASE UCI — Complete Pipeline
#  Cleaning → EDA Plots → Feature Engineering →
#  Multiclass Models (SVM, RF, MLP) + GridSearchCV
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (classification_report, confusion_matrix,
                             accuracy_score, ConfusionMatrixDisplay)

SEED = 42

# ============================================================
# 1. IMPORTING DATASET
# ============================================================
df = pd.read_csv("heart_disease_uci.csv")
print(df.head())


# ============================================================
# 2. ANALYZING DATASET
# ============================================================
print(df.info())

df.describe(include='all')


# ============================================================
# 3. HANDLE MISSING VALUES
# ============================================================
print(df.isnull().sum())

# numerical columns
num_cols = df.select_dtypes(include=['float64', 'int64']).columns

# categorical columns
cat_cols = df.select_dtypes(include=['object']).columns

# fill missing values safely
for col in num_cols:
    df[col] = df[col].fillna(df[col].median())

for col in cat_cols:
    df[col] = df[col].fillna(df[col].mode()[0])


# ============================================================
# 4. REMOVE DUPLICATES
# ============================================================
df.drop_duplicates(inplace=True)


# ============================================================
# 5. OUTLIERS
# ============================================================

# --- 5a. Boxplots (visualise before clipping) ---
for col in num_cols:
    plt.figure(figsize=(6, 4))
    sns.boxplot(x=df[col])
    plt.title(f'Boxplot of {col}')
    plt.show()

# --- 5b. IQR Clipping ---
for col in num_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1

    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR

    df[col] = np.where(df[col] < lower, lower,
               np.where(df[col] > upper, upper, df[col]))


# ============================================================
# 6. UNIVARIATE ANALYSIS
# ============================================================

# --- Numerical features ---
for col in num_cols:
    plt.figure(figsize=(6, 4))
    sns.histplot(df[col], kde=True)
    plt.title(f'Distribution of {col}')
    plt.show()

# --- Categorical features ---
for col in cat_cols:
    plt.figure(figsize=(6, 4))
    sns.countplot(x=df[col])
    plt.title(f'Count of {col}')
    plt.xticks(rotation=45)
    plt.show()


# ============================================================
# 7. BIVARIATE ANALYSIS
# ============================================================

# --- Numerical vs Target ---
for col in num_cols:
    plt.figure(figsize=(6, 4))
    sns.boxplot(x=df['num'], y=df[col])
    plt.title(f'{col} vs Heart Disease')
    plt.show()

# --- Categorical vs Target ---
for col in cat_cols:
    plt.figure(figsize=(7, 4))
    sns.countplot(x=df[col], hue=df['num'])
    plt.title(f'{col} vs Heart Disease')
    plt.xticks(rotation=45)
    plt.show()

# --- Correlation Heatmap ---
plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(numeric_only=True), annot=True)
plt.title("Correlation Matrix")
plt.show()

# --- Pair Plot ---
sns.pairplot(df[['age', 'chol', 'thalch', 'oldpeak', 'num']], hue='num')
plt.show()


# ============================================================
# 8. FEATURE ENGINEERING
# ============================================================
print("\n--- Feature Engineering ---")

# Drop non-predictive columns if present
df.drop(columns=[c for c in ['id', 'dataset'] if c in df.columns], inplace=True)

# Re-derive column type lists after dropping
num_cols = [c for c in df.select_dtypes(include=['float64', 'int64']).columns if c != 'num']
cat_cols  = df.select_dtypes(include=['object']).columns.tolist()

# --- 8a. Age Group Binning ---
# Groups continuous age into clinically meaningful brackets.
# Captures the non-linear relationship between age and heart disease risk.
df['age_group'] = pd.cut(
    df['age'],
    bins=[0, 40, 50, 60, 100],
    labels=['<40', '40-50', '50-60', '60+']
)

# --- 8b. Cholesterol Risk Flag ---
# Binary flag: cholesterol > 200 mg/dL is the standard clinical threshold
# for elevated cardiovascular risk.
df['chol_risk'] = (df['chol'] > 200).astype(int)

# --- 8c. High Max Heart Rate Flag ---
# Patients above the mean thalch have better cardiovascular fitness;
# below-average thalch is associated with higher disease severity.
df['high_thalch'] = (df['thalch'] > df['thalch'].mean()).astype(int)

# --- 8d. Age-to-Thalch Interaction Feature ---
# Older age combined with lower max heart rate indicates higher risk.
# This ratio captures that joint effect in a single numeric feature.
df['age_thalch_ratio'] = df['age'] / (df['thalch'] + 1)

# --- 8e. Oldpeak Severity Binning ---
# Bins ST depression (oldpeak) into clinically labelled severity levels,
# aligning the feature with standard ECG interpretation guidelines.
df['oldpeak_cat'] = pd.cut(
    df['oldpeak'],
    bins=[-0.1, 0, 1, 2, 10],
    labels=['none', 'mild', 'moderate', 'severe']
)

print("New features: age_group, chol_risk, high_thalch, age_thalch_ratio, oldpeak_cat")
print(df[['age_group', 'chol_risk', 'high_thalch', 'age_thalch_ratio', 'oldpeak_cat']].head())

# --- Visualise engineered features ---
fig, axes = plt.subplots(1, 3, figsize=(16, 5))
fig.suptitle("Feature Engineering – New Features vs Heart Disease", fontsize=13, fontweight='bold')

for ax, col, title in zip(
    axes,
    ['age_group', 'chol_risk', 'oldpeak_cat'],
    ['Age Group vs Heart Disease', 'Cholesterol Risk vs Heart Disease', 'Oldpeak Category vs Heart Disease']
):
    order = df[col].cat.categories if hasattr(df[col], 'cat') else df[col].value_counts().index
    sns.countplot(x=col, hue='num', data=df, ax=ax, order=order, palette='Set2')
    ax.set_title(title, fontsize=11)
    ax.set_xlabel('')
    ax.legend(title='num', fontsize=8, title_fontsize=8)

plt.tight_layout()
plt.show()


# ============================================================
# 9. DATA PREPARATION FOR MODELLING
# ============================================================
df_model = df.copy()

# Label-encode all categorical / ordinal columns
le = LabelEncoder()
encode_cols = df_model.select_dtypes(include=['object', 'category']).columns.tolist()
for col in encode_cols:
    df_model[col] = le.fit_transform(df_model[col].astype(str))

X = df_model.drop(columns=['num'])
y = df_model['num']

# StandardScaler — essential for SVM and MLP
scaler   = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=SEED, stratify=y
)

print(f"\nTrain : {X_train.shape}  |  Test : {X_test.shape}")
print("Classes:", sorted(y.unique()))

# 5-fold Stratified CV (preserves class proportions in every fold)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)


# ============================================================
# 10. MULTICLASS CLASSIFICATION + HYPERPARAMETER TUNING
# ============================================================
results = {}

# ----------------------------------------------------------
# 10a. Support Vector Machine (SVM)
# ----------------------------------------------------------
print("\n[1/3] SVM — GridSearchCV")

svm_param_grid = {
    'C'      : [0.1, 1, 10],        # Regularisation strength
    'kernel' : ['rbf', 'linear'],   # Kernel type
    'gamma'  : ['scale', 'auto']    # Kernel coefficient (rbf only)
}

svm_grid = GridSearchCV(
    estimator  = SVC(random_state=SEED, probability=True),
    param_grid = svm_param_grid,
    cv         = cv,
    scoring    = 'accuracy',
    n_jobs     = -1,
    verbose    = 1
)
svm_grid.fit(X_train, y_train)
svm_pred = svm_grid.predict(X_test)

results['SVM'] = {
    'best_params'  : svm_grid.best_params_,
    'cv_accuracy'  : svm_grid.best_score_,
    'test_accuracy': accuracy_score(y_test, svm_pred),
    'predictions'  : svm_pred
}
print(f"  Best Params   : {svm_grid.best_params_}")
print(f"  CV Accuracy   : {svm_grid.best_score_:.4f}")
print(f"  Test Accuracy : {results['SVM']['test_accuracy']:.4f}")

# ----------------------------------------------------------
# 10b. Random Forest
# ----------------------------------------------------------
print("\n[2/3] Random Forest — GridSearchCV")

rf_param_grid = {
    'n_estimators'    : [100, 200],      # Number of trees
    'max_depth'       : [None, 10, 20],  # Maximum tree depth
    'min_samples_split': [2, 5]          # Min samples to split a node
}

rf_grid = GridSearchCV(
    estimator  = RandomForestClassifier(random_state=SEED),
    param_grid = rf_param_grid,
    cv         = cv,
    scoring    = 'accuracy',
    n_jobs     = -1,
    verbose    = 1
)
rf_grid.fit(X_train, y_train)
rf_pred = rf_grid.predict(X_test)

results['Random Forest'] = {
    'best_params'  : rf_grid.best_params_,
    'cv_accuracy'  : rf_grid.best_score_,
    'test_accuracy': accuracy_score(y_test, rf_pred),
    'predictions'  : rf_pred
}
print(f"  Best Params   : {rf_grid.best_params_}")
print(f"  CV Accuracy   : {rf_grid.best_score_:.4f}")
print(f"  Test Accuracy : {results['Random Forest']['test_accuracy']:.4f}")

# ----------------------------------------------------------
# 10c. MLP Neural Network
# ----------------------------------------------------------
print("\n[3/3] MLP Neural Network — GridSearchCV")

mlp_param_grid = {
    'hidden_layer_sizes': [(64, 32), (128, 64)],   # Network architecture
    'activation'        : ['relu', 'tanh'],         # Activation function
    'alpha'             : [0.0001, 0.001],          # L2 regularisation
    'max_iter'          : [500]
}

mlp_grid = GridSearchCV(
    estimator  = MLPClassifier(random_state=SEED, early_stopping=True),
    param_grid = mlp_param_grid,
    cv         = cv,
    scoring    = 'accuracy',
    n_jobs     = -1,
    verbose    = 1
)
mlp_grid.fit(X_train, y_train)
mlp_pred = mlp_grid.predict(X_test)

results['MLP'] = {
    'best_params'  : mlp_grid.best_params_,
    'cv_accuracy'  : mlp_grid.best_score_,
    'test_accuracy': accuracy_score(y_test, mlp_pred),
    'predictions'  : mlp_pred
}
print(f"  Best Params   : {mlp_grid.best_params_}")
print(f"  CV Accuracy   : {mlp_grid.best_score_:.4f}")
print(f"  Test Accuracy : {results['MLP']['test_accuracy']:.4f}")


# ============================================================
# 11. MODEL EVALUATION
# ============================================================

# --- Classification Reports ---
for name, res in results.items():
    print(f"\n--- {name} Classification Report ---")
    print(classification_report(y_test, res['predictions'], zero_division=0))

# --- Confusion Matrices ---
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle("Confusion Matrices (Test Set)", fontsize=13, fontweight='bold')
for ax, (name, res) in zip(axes, results.items()):
    cm   = confusion_matrix(y_test, res['predictions'])
    disp = ConfusionMatrixDisplay(cm, display_labels=[0, 1, 2, 3, 4])
    disp.plot(ax=ax, colorbar=False, cmap='Blues')
    ax.set_title(f"{name}\nTest Acc: {res['test_accuracy']:.4f}")
plt.tight_layout()
plt.show()

# --- CV vs Test Accuracy Bar Chart ---
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("Model Comparison", fontsize=13, fontweight='bold')

names       = list(results.keys())
cv_scores   = [results[n]['cv_accuracy']   for n in names]
test_scores = [results[n]['test_accuracy'] for n in names]
x, w = np.arange(len(names)), 0.35

axes[0].bar(x - w/2, cv_scores,   w, label='CV Accuracy',   color='steelblue')
axes[0].bar(x + w/2, test_scores, w, label='Test Accuracy', color='salmon')
axes[0].set_xticks(x)
axes[0].set_xticklabels(names)
axes[0].set_ylim(0, 1)
axes[0].set_ylabel('Accuracy')
axes[0].set_title('CV vs Test Accuracy')
axes[0].legend()
for i, (cv, te) in enumerate(zip(cv_scores, test_scores)):
    axes[0].text(i - w/2, cv + 0.01, f'{cv:.3f}', ha='center', fontsize=9)
    axes[0].text(i + w/2, te + 0.01, f'{te:.3f}', ha='center', fontsize=9)

# --- Feature Importances (Random Forest) ---
feat_names  = X.columns.tolist()
importances = rf_grid.best_estimator_.feature_importances_
sorted_idx  = np.argsort(importances)[-15:]
axes[1].barh([feat_names[i] for i in sorted_idx], importances[sorted_idx], color='mediumseagreen')
axes[1].set_title('Top 15 Feature Importances (Random Forest)')
axes[1].set_xlabel('Importance')

plt.tight_layout()
plt.show()


# ============================================================
# 12. FINAL SUMMARY
# ============================================================
print("\n" + "="*60)
print("  FINAL SUMMARY")
print("="*60)
summary = pd.DataFrame([{
    'Model'        : name,
    'CV Accuracy'  : f"{res['cv_accuracy']:.4f}",
    'Test Accuracy': f"{res['test_accuracy']:.4f}",
    'Best Params'  : res['best_params']
} for name, res in results.items()])
print(summary.to_string(index=False))
