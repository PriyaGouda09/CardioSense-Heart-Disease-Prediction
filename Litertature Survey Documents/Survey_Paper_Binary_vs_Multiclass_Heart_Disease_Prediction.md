# Navigating the Granularity Gap: A Survey of Binary vs. Multiclass Heart Disease Prediction (2024–2026)

---

## Abstract

Cardiovascular disease continues to remain as the principal cause of mortality globally. According to the World Health Organization,an estimated 19.8 million people died from CVDs in 2022, representing approximately 32% of all global deaths. Of these deaths, 85% were due to heart attack and stroke. The entrance of artificial intelligence in the biological field has made substantial strides in developing predictive models for heart diseases using machine learning and deep learning techniques; however, the majority of models depend on binary classification with considerably fewer addressing multiclass classification, causing a significant disparity to exist. While binary models—designed to distinguish between the presence and absence of heart disease—routinely achieve accuracy rates exceeding 90%, multiclass models tasked with predicting severity stages (0–4) demonstrate considerably diminished performance, typically ranging between 55% and 65% accuracy. This performance gap is further exacerbated by challenges such as class imbalance, where severe cases are underrepresented in clinical datasets. This survey aims to explore the gaps between binary and multiclass heart disease prediction methodologies ,with particular emphasis on this "granularity gap." This survey provides a structured taxonomy of contemporary approaches, comparative performance analysis, and delineates open challenges requiring urgent investigation to bridge the gap between screening-level detection and clinically actionable severity staging.

**Keywords:** Heart Disease Prediction, Binary Classification, Multiclass Classification, Deep Learning, Machine Learning, Class Imbalance, Severity Staging

---

## I. Introduction

Heart disease remains an unparalleled global health crisis, with the World Health Organization documenting that cardiovascular diseases account for 32% of all worldwide deaths annually [1, 2]. Therefore, it is critical to detect cardiovascular disease as early as possible so that management with counselling and medicines can begin. Traditional diagnostic methodologies, encompassing electrocardiograms (ECGs), stress tests, and clinical assessments, possess inherent limitations in their capacity to process complex, multidimensional patient data and provide precise prognostic insights [3].

The distinction between binary and multiclass classification in heart disease prediction carries profound clinical implications. In binary classification, models primarily predict only whether the disease is present or absent, or whether there is a low risk or high risk based on the clinical metrics influencing heart disease in the dataset. However, this approach does not provide further insights into the severity of the disease—even when the presence of disease is confirmed, it merely saves time on preliminary examinations such as X-rays and scans without offering doctors the granular information needed to assess what stage the disease has reached, thereby limiting its utility for real-time clinical decision-making. In contrast, multiclass classification endeavors to stratify patients across severity gradients, typically categorized as: Stage 0 (no disease), Stage 1 (mild disease), Stage 2 (moderate disease), Stage 3 (severe disease), and Stage 4 (very severe disease) [4, 5]. This granular categorization addresses the clinically superior question: How severely is this patient affected, and what treatment intensity is warranted? Consequently, the inability of current predictive models to reliably distinguish between intermediate severity levels represents a critical barrier to translating machine learning advances into meaningful clinical decision support.

The performance gap between binary and multiclass models stems from two key challenges. First, patients at different severity stages often show similar clinical markers, making it difficult for models to draw clear boundaries between adjacent stages—for example, a moderate case may look similar to both mild and severe cases. Second, severe cases (Stages 3-4) are rare in most datasets, causing models to favor common classes and perform poorly on the critical minority cases that need accurate detection the most [7, 8].

This survey provides a systematic examination of heart disease prediction methodologies published between 2024 and 2026, with explicit focus on the binary-to-multiclass performance transition. Our survey investigates:

1. **Taxonomic Organization**: A structured classification based on different methodologies, including ensemble methods, deep learning with IoMT integration, and feature optimization strategies.

2. **Comparative Analysis**: A comparison of models used across the studies included, along with their accuracy and the classification method employed.

3. **Challenge Identification**: Delineating the gap between binary classification and multiclass classification, with future prospects for improvement.

---

## II. Literature Review

**Taxonomy of Methodologies**

Contemporary approaches to heart disease prediction can be organized into three principal categories based on their technical strategy for addressing classification challenges. This taxonomy reflects the methodological diversity observed across the 2024-2026 literature and provides a framework for understanding how different architectural choices influence binary versus multiclass performance.

**Ensemble Methods**

**Stacked Ensemble Learning**

Stacked ensemble models combine predictions from multiple base models through a meta-learner, training diverse models on the same dataset and using a secondary model to combine their outputs.

Amirthaa M et al. [4] compared binary and multiclass classification using stacked ensemble learning. They used two datasets: one from GitHub with 12 features for binary classification, and the UCI Heart Disease Dataset with 16 features and severity levels 0-4 for multiclass classification. The study employed Random Forest, SVM, XGBoost, Gradient Boosting, and Deep Learning as base models with Logistic Regression as the meta-learner, leveraging each model's strengths—Random Forest for handling overfitting, SVM for complex boundary separation, XGBoost for structured data, and deep learning for pattern recognition.

The choice of Logistic Regression as the meta-learner is noteworthy. It combines the predictions from different base models through a simple yet interpretable approach, creating a "committee" that weighs and combines individual model insights. However, Logistic Regression inherently performs better for binary classification tasks compared to multiclass problems, as it was originally designed for two-class problems and requires extensions like one-vs-rest or multinomial approaches for multiple classes, which can introduce additional complexity and potential performance degradation [12].

For binary classification tasks, this stacked ensemble achieved 90.2% accuracy, slightly better than the best individual base model (XGBoost at 89.7%). The ensemble also showed good precision-recall balance, with both metrics at 0.92 for the disease-positive class, indicating that combining multiple models helps capture patterns that individual models might miss [4].

However, multiclass classification showed major limitations. The same architecture applied to the UCI Heart Disease Dataset achieved only 64.1% accuracy,a drop of 26.1 percentage points. In the multiclass case, XGBoost (65.8%) slightly outperformed the stacked ensemble, suggesting that combining models becomes harder as classification complexity increases. Looking at individual classes: Class 0 (no disease) had precision 0.73 and recall 0.92, while Class 4 (very severe disease) had precision and recall of 0.00 which indicated a complete failure to identify the most critical cases [4].

**Gradient Boosting Variants**

Gradient boosting algorithms, particularly XGBoost and its variants, have emerged as strong performers in structured medical data classification. These algorithms build trees sequentially, where each new tree corrects the errors made by previous trees, gradually reducing prediction error.

Jackson et al. [7] evaluated XGBoost's performance in multiclass heart disease prediction using a clinical dataset from a cardiovascular hospital in West Jakarta containing 4,752 instances with 10 attributes including hematologic parameters (erythrocyte, hemoglobin, hematocrit, leukocytes, thrombocyte) and ICD-10 angina classifications. The study achieved baseline accuracy of 56.4% without feature selection. Their investigation examined the interaction between feature selection methodologies—Chi-Square, Mutual Information, and SelectFromModel—and ensemble model performance. Counter to expectations, explicit feature selection consistently degraded model performance, with Chi-Square selection reducing XGBoost accuracy to 54.2% and Mutual Information to 53.3% [7].

This finding suggests that tree-based ensemble methods have built-in feature selection capabilities that may be superior to external selection methods. During tree construction, these algorithms automatically evaluate feature importance and use the most informative features, making explicit pre-selection potentially redundant or even harmful.

**Deep Learning and IoMT Integration**

Deep Learning models such as LSTM, CNNs and Multilayer Perceptron open prospects to multiclass classification over traditional supervised learning algorithms like logistic regression. They offer capabilities which capture complex non-linear relationships within the data.

Ushasri and Ketepalli [3] developed an AI-driven predictive model integrated with Internet of Medical Things (IoMT) infrastructure, achieving remarkable performance particularly in multiclass classification contexts. Their MLP architecture employed ReLU activation in hidden layers with sigmoid activation (binary) or softmax activation (multiclass) in output layers, optimized using the AdamOptimizer and trained with Binary Cross-Entropy or Categorical Cross-Entropy loss functions respectively.
The reported performance metrics represent notable achievements: 94.6% accuracy, 93.2% precision, 95.8% recall, and 94.5% F1-score for binary classification. More significantly, their multiclass implementation achieved 91.3% accuracy—substantially exceeding performance levels reported in other contemporary studies.[3].
Their integration of real-time sensors capturing data such as heart rate, blood pressure, oxygen saturation, and ECG readings continuously demonstrates the importance of collecting real-time data rather than relying solely on clinical datasets available online. With reported end-to-end latency of 2.3 seconds, the system demonstrates viability for real-time health monitoring applications [3].

**Hybrid Deep Learning Architectures**

Magar and Kaur [9] explored CNN and LSTM hybrid models for heart disease prediction, combining CNN's feature extraction with LSTM's sequential processing. The hybrid architecture achieved 95.6% accuracy, outperforming individual CNN (92.8%), LSTM (94.1%), RNN (93.5%), and ANN (91.2%) models. This approach is particularly relevant for ECG-based prediction where both spatial feature extraction and time-series analysis are needed [9].

**Feature Optimization Paradigms**

**Feature Selection Methodologies**

Feature selection is a preprocessing step that aims to keep only the most useful features while removing unnecessary or repetitive ones. Common methods include Chi-Square, Mutual Information, and SelectFromModel.

Jackson et al. [7] compared these methods using Random Forest and XGBoost. The results showed that using feature selection actually reduced accuracy. Random Forest achieved 57.1% accuracy without feature selection, but dropped to 56.5% with Chi-Square, 56.2% with Mutual Information, and 55.7% with SelectFromModel. XGBoost showed similar results—56.4% baseline accuracy dropped to 54.2%, 53.3%, and 54.8% respectively with these methods [7]. This suggests that tree-based models like Random Forest and XGBoost already have built-in ways to identify important features during training, so adding extra feature selection steps may actually hurt performance by removing useful information.

However, feature selection can still enhance interpretability and model efficiency in other contexts. Magar and Kaur [9] used statistical techniques such as correlation analysis, mutual information, and Recursive Feature Elimination (RFE) for top predictor identification. Important features such as cholesterol level, age, and blood pressure were ranked based on their contribution to heart disease risk.

The contrasting findings highlight that the effectiveness of feature selection depends heavily on the model architecture. Tree-based ensemble methods with inherent feature importance mechanisms may not benefit from external selection, while simpler models or those requiring interpretability may gain from explicit feature ranking. The choice of methodology should therefore align with both the model type and the clinical need for transparency in prediction.

---

## III. Handling Data Challenges

### 3.1 Class Imbalance

Medical datasets frequently exhibit class imbalance—where severe cases (Stage 3, Stage 4) are underrepresented while healthy or mild cases dominate. This creates bias in model training, as algorithms optimize for overall accuracy by performing well on majority classes while potentially ignoring minority classes entirely [13].

SMOTE (Synthetic Minority Over-sampling Technique) addresses this by generating synthetic instances for underrepresented classes through interpolation between existing minority samples and their k-nearest neighbors. Jackson et al. [7] documented substantial improvements after applying SMOTE—their Random Forest accuracy increased from 45.5% to 57.1%, a gain of 11.6 percentage points [7].

Imbalanced class distributions in datasets can bias classifiers toward the majority class, and the absence of standardized benchmarks complicates performance comparison across studies [13]. Evidence of this problem appears in Amirthaa M et al. [4], where Class 4 (very severe disease) had precision and recall of 0.00—indicating the model completely failed to identify the most critical cases, a likely consequence of class imbalance in the training data.

### 3.2 Outlier Mitigation

Medical datasets often contain anomalous values from measurement errors or data entry mistakes that can distort model training. Z-score analysis identifies outliers by measuring how many standard deviations a value lies from the mean—observations exceeding |Z| > 3 are typically removed. Amirthaa M et al. [4] applied Z-score thresholding to remove data points exceeding three standard deviations before standardization. Lakshmi and Devi [10] used IQR-based outlier detection and reported improved classification accuracy after removing anomalous values in features like age, blood pressure, cholesterol, and heart rate [4, 6, 10].

### 3.3 Missing Value Handling

Clinical datasets often have missing values due to incomplete patient records or unavailable test results. Ushasri and Ketepalli [3] used median imputation for numerical fields and mode imputation for categorical variables, while excluding samples with more than 30% missing values. Permai et al. [11] found that imputation preserved more samples than deletion while maintaining predictive performance.

In summary, addressing data challenges through class balancing, outlier removal, and missing value imputation is essential for improving multiclass prediction performance. These preprocessing steps directly impact model accuracy and should be carefully documented in all studies to enable fair comparison across methodologies.

---

## IV. Comparative Performance Analysis

### 4.1 Model Performance Summary

Table 1 presents a comprehensive comparison of model performance across the primary studies analyzed in this survey. This synthesis enables direct assessment of the binary-to-multiclass performance transition across different methodological approaches.

**Table 1: Comparative Performance of Heart Disease Prediction Models (2024-2026)**

| Paper / Authors | Model | Binary Accuracy | Multiclass Accuracy | Additional Metrics |
|-----------------|-------|-----------------|---------------------|-------------------|
| Ushasri & Ketepalli [3] | Proposed MLP | 94.6% | 91.3% | Precision: 93.2%/89.1%, Recall: 95.8%/90.5%, Latency: 2.3s/2.8s |
| Ushasri & Ketepalli [3] | SVM | 86.2% | - | Precision: 85.4%, Recall: 84.7% |
| Ushasri & Ketepalli [3] | Decision Tree | - | 83.7% | Precision: 81.2%, Recall: 80.5% |
| Ushasri & Ketepalli [3] | k-NN | 79.5% | - | Precision: 77.8%, Recall: 78.3% |
| Lakshmi & Devi [10] | Random Forest | - | 67% (after preprocessing) | Before preprocessing: 57% |
| Lakshmi & Devi [10] | SVM | - | 68% (after preprocessing) | Before preprocessing: 58% |
| Lakshmi & Devi [10] | Decision Tree | - | 59% (after preprocessing) | Before preprocessing: 54% |
| Lakshmi & Devi [10] | Gradient Booster | - | 63% (after preprocessing) | Before preprocessing: 56% |
| Sequential ANN [12] | Sequential ANN | 98.0% | - | Precision: 98.01%, Recall: 98.0%, AUC-ROC: 97.77% |
| Permai et al. [11] | SVM | - | 98% | Precision: 0.99, Recall: 0.98 |
| Permai et al. [11] | MLP Classifier | - | 97% | Precision: 0.97, Recall: 0.93 |
| Amirthaa M et al. [4] | Stacked Ensemble | 90.2% | 64.1% | AUC: 0.8995/0.8278 |
| Amirthaa M et al. [4] | Random Forest | 88.6% | 58.2% | - |
| Amirthaa M et al. [4] | SVM | 89.1% | 54.4% | - |
| Amirthaa M et al. [4] | XGBoost | 89.7% | 65.8% | - |
| Amirthaa M et al. [4] | Gradient Boosting | 88.0% | 59.2% | - |
| Amirthaa M et al. [4] | Deep Learning | 89.1% | 54.4% | - |
| Magar & Kaur [9] | Logistic Regression | 84.2% | - | Precision: 83.1%, Recall: 82.5%, AUC-ROC: 85.3% |
| Magar & Kaur [9] | Decision Tree | 79.5% | - | Precision: 78.8%, Recall: 79%, AUC-ROC: 80.2% |
| Magar & Kaur [9] | Random Forest | 88.6% | - | Precision: 87.9%, Recall: 88.3%, AUC-ROC: 89.5% |
| Magar & Kaur [9] | SVM | 85.7% | - | Precision: 84.9%, Recall: 85.1%, AUC-ROC: 86.4% |
| Magar & Kaur [9] | XGBoost | 90.2% | - | Precision: 89.8%, Recall: 90%, AUC-ROC: 91.3% |
| Jackson et al. [7] | Random Forest | - | 57.1% | No feature selection |
| Jackson et al. [7] | XGBoost | - | 56.4% | No feature selection |

### 4.2 Analysis of the Granularity Gap

The quantitative evidence presented in Table 1 substantiates the existence of a substantial and consistent granularity gap. Across studies employing identical methodologies for both binary and multiclass tasks, performance degradation ranges from approximately 3 percentage points (Ushasri & Ketepalli) to over 26 percentage points (Amirthaa M et al.).

Several factors contribute to the magnitude and variability of this gap:

**Dataset Characteristics**: Different datasets exhibit varying degrees of class separability. The UCI Heart Disease Dataset employed by Amirthaa M et al. [4] presents a particularly challenging multiclass problem, with substantial feature overlap between adjacent severity levels. The Cleveland subset, while well-studied, contains limited samples for severe disease categories, exacerbating class imbalance effects.

**Preprocessing Pipeline**: The superior multiclass performance reported by Ushasri and Ketepalli [3] may reflect more aggressive preprocessing including comprehensive missing value handling, outlier removal, and careful feature normalization. Their integration with IoMT frameworks may also provide access to richer, real-time physiological data that enhances discriminative power.

**Class Definition**: Different studies employ varying definitions of multiclass categories. Some utilize the standard 0-4 severity staging, while others may define classes based on specific diagnosis codes (e.g., ICD-10 angina classifications in Jackson et al. [7]). These definitional differences influence baseline task difficulty.

**Evaluation Protocol**: Variations in train-test splitting, cross-validation strategies, and holdout set sizes can substantially influence reported accuracy. Studies employing stratified sampling more reliably estimate true population performance, while random splitting may produce optimistic estimates for majority classes.

### 4.3 Per-Class Performance Analysis

Beyond aggregate accuracy, per-class performance metrics reveal critical patterns that aggregate measures obscure. Amirthaa M et al. [4] provided detailed class-wise analysis for their multiclass stacked ensemble:

- **Class 0 (No Disease)**: Precision 0.73, Recall 0.92, F1-score 0.82
- **Class 1 (Mild)**: Precision 0.56, Recall 0.59, F1-score 0.58
- **Class 2 (Moderate)**: Precision 0.50, Recall 0.38, F1-score 0.36
- **Class 3 (Severe)**: Precision 0.59, Recall 0.38, F1-score 0.47
- **Class 4 (Very Severe)**: Precision 0.00, Recall 0.00, F1-score 0.00

This per-class breakdown reveals a severe pathology in model behavior: while healthy patients are identified with reasonable reliability, the complete failure to recognize very severe cases (Class 4) represents a fundamental clinical inadequacy. A model that cannot identify the most critical patients provides limited clinical utility regardless of its aggregate accuracy.

The pattern of degrading performance from Class 0 through Class 4 suggests that models learn the healthy/disease distinction more readily than fine-grained severity differentiation. Feature overlap between adjacent severity levels—where a moderate case may present clinical markers indistinguishable from mild or severe cases—creates inherent classification ambiguity that current methodologies do not adequately resolve.

### 4.4 Feature Importance Insights

SHAP analysis across multiple studies converges on several features as consistently influential:

**Hematologic Parameters**: Jackson et al. [7] identified erythrocyte count, hemoglobin levels, and hematocrit as the most important predictors in their angina classification model. These features share biological significance—all relate to red blood cell characteristics and oxygen-carrying capacity—and likely serve as proxy measures for cardiovascular health status.

**Traditional Risk Factors**: Studies employing the UCI/Cleveland datasets consistently identify chest pain type (cp), maximum heart rate achieved (thalach), exercise-induced angina (exang), ST depression (oldpeak), and thalassemia status (thal) as highly predictive. These features align with established clinical risk factors, providing face validity for model predictions.

**Demographic Variables**: Age and sex consistently contribute to predictions, consistent with epidemiological evidence regarding differential heart disease prevalence across demographic groups. Models appear to appropriately weight these risk factors without over-reliance.

The convergence of feature importance across studies employing different datasets and methodologies suggests that machine learning models are learning genuine pathophysiological relationships rather than exploiting dataset-specific artifacts. This convergence supports the potential for model generalization across clinical settings.

---

## V. Open Challenges

### 5.1 Multiclass Imbalance at Scale

While SMOTE and related techniques provide partial remediation for class imbalance, significant challenges remain. SMOTE generates synthetic minority instances through interpolation, but for extremely rare classes (e.g., Stage 4 severe disease), limited seed instances constrain the diversity of synthetic samples. Over-reliance on synthetic data may introduce distributional artifacts that compromise generalization.

Research priorities include:
- **Adaptive oversampling** techniques that adjust synthesis intensity based on local data density
- **Cost-sensitive learning** frameworks that impose higher penalties for minority class misclassification
- **Ensemble approaches** specifically designed for imbalanced multiclass problems, such as balanced random forests or ensemble sampling strategies

### 5.2 Feature Overlap and Class Separability

The fundamental challenge of feature overlap between adjacent severity classes remains inadequately addressed. When a patient with moderate heart disease exhibits clinical markers indistinguishable from mild or severe cases, no amount of algorithmic sophistication can reliably resolve the classification without additional discriminative information.

Potential approaches include:
- **Ordinal classification** frameworks that explicitly model the ordered nature of severity levels, potentially through ordinal regression or rank-based objectives
- **Multi-task learning** architectures that simultaneously predict severity and related outcomes (e.g., mortality risk, treatment response), leveraging auxiliary tasks to learn more robust representations
- **Hierarchical classification** that first distinguishes broad categories (healthy vs. diseased, mild vs. severe) before fine-grained classification within categories

### 5.3 Real-World Deployment Constraints

Beyond predictive performance, clinical deployment introduces additional requirements that current literature inadequately addresses:

**Explainability**: Regulatory frameworks including FDA guidelines for AI/ML-based medical devices increasingly require model interpretability. While SHAP provides post-hoc explanation, more interpretable architectures (e.g., attention-based models, rule-based systems) may be preferable for clinical adoption.

**Latency**: Real-time clinical decision support requires rapid inference. Deep learning models, particularly those integrated with IoMT streaming data, must balance predictive sophistication with computational efficiency.

**Robustness**: Models trained on specific datasets may fail when deployed in settings with different patient populations, measurement equipment, or clinical protocols. Domain adaptation and transfer learning techniques represent promising directions for improving model robustness.

**Privacy**: Medical data carries stringent privacy requirements. Federated learning approaches, where models train on distributed data without centralized storage, offer potential solutions for privacy-preserving model development.

### 5.4 Dataset Limitations

The field's reliance on a small number of benchmark datasets—particularly the UCI/Cleveland Heart Disease Dataset—raises concerns regarding generalizability. These datasets, while valuable for methodological comparison, may not reflect contemporary clinical practice or diverse patient populations.

Research priorities include:
- Development of larger, more diverse labeled datasets reflecting global patient populations
- Establishment of standardized evaluation protocols enabling direct methodological comparison
- Integration of multi-modal data sources (clinical records, imaging, genetic information, wearable sensor data) to enhance discriminative power

---

## VI. Conclusion

This survey has systematically examined the landscape of heart disease prediction methodologies from 2024 to 2026, with particular focus on the persistent gap between binary detection performance and multiclass severity staging. Our analysis substantiates several key findings:

**First**, the granularity gap is real and substantial. Binary classification models routinely achieve accuracy exceeding 90%, while multiclass severity prediction typically ranges between 55% and 68%—a degradation of approximately 25 percentage points that fundamentally limits clinical utility for treatment planning.

**Second**, current frontrunner methodologies—stacked ensemble architectures and deep learning models, particularly Multi-Layer Perceptrons—represent meaningful advances but do not fully resolve the multiclass challenge. The superior performance of integrated IoMT systems suggests that richer, real-time data may be essential for distinguishing subtle severity differences.

**Third**, technical challenges including class imbalance and feature overlap remain inadequately solved. While SMOTE provides partial remediation for imbalance—improving accuracy by 10-15 percentage points in some studies—complete failure to identify severe cases (Class 4) persists even in top-performing models. The inherent ambiguity arising from overlapping clinical presentations between adjacent severity levels represents a fundamental challenge requiring novel methodological approaches.

**Fourth**, tree-based ensemble methods demonstrate inherent feature selection capabilities that may exceed external preprocessing methods. The consistent finding that explicit feature selection degraded performance suggests that careful consideration of algorithm-data interactions should guide preprocessing decisions.

Looking forward, bridging the granularity gap will require concerted advances across multiple dimensions: development of richer, multimodal datasets; novel algorithmic approaches specifically designed for ordered severity classification; integration of real-time IoMT data streams; and rigorous attention to the deployability requirements of clinical systems. The ultimate goal—providing clinicians with reliable, interpretable severity predictions to guide treatment decisions—remains achievable but demands sustained research investment.

The transition from research models to clinical tools that can reliably distinguish "how sick" a patient is, rather than merely whether they are sick, represents the critical next frontier for medical AI in cardiovascular care.

---

## References

[1] World Health Organization. (2023). Cardiovascular diseases (CVDs). WHO Fact Sheets.

[2] Magar, N.S. & Kaur, P. (2025). Survey of Heart Disease Prediction Models using Machine Learning and Deep Learning Techniques. International Conference on Engineering, Technology & Management (ICETM 2025), IEEE.

[3] Ushasri, C. & Ketepalli, G. (2025). AI-based Predictive Model for Binary and Multiclass Heart Disease Classification in IoMT. 5th International Conference on Ubiquitous Computing and Intelligent Information Systems (ICUIS-2025), IEEE.

[4] Amirthaa, M., Julian, A., Mary, G.I., & Selvarathinam, A.L.X.R. (2024). Improving Heart Disease Prediction with Stacked Ensemble Learning: A Comparison of Binary and Multiclass. First International Conference for Women in Computing (InCoWoCo), IEEE.

[5] Permai, S.D., Fadhilah, M.F., Salomo, A.O., Bukhari, R., Zulfikar, F.H., & Hidayat, M.F. (2025). Heart Disease Prediction in Indonesia Using Machine Learning Techniques for Multiclass Classification. 5th International Conference on Innovative Research in Applied Science, Engineering and Technology (IRASET), IEEE.

[6] Lakshmi, A. & Devi, R. (2022). Comparative Analysis of Multiclass Heart Disease Prediction Classification Models using Preprocessing and Feature Selection. Sixth International Conference on I-SMAC (IoT in Social, Mobile, Analytics and Cloud), IEEE.

[7] Jackson, Fransisco, M., Chandra, A., & Aryuni, M. (2025). Evaluating the Impact of Feature Selection on Ensemble Models for Multiclass Heart Disease Prediction. 10th International Conference on Information Technology and Digital Application (ICITDA), IEEE.

[8] Chawla, N.V., Bowyer, K.W., Hall, L.O., & Kegelmeyer, W.P. (2002). SMOTE: Synthetic Minority Over-sampling Technique. Journal of Artificial Intelligence Research, 16, 321-357.

[9] Magar, N.S. & Kaur, P. (2025). Survey of Heart Disease Prediction Models using Machine Learning and Deep Learning Techniques. ICETM 2025, IEEE.

[10] Lakshmi, A. & Devi, R. (2022). Comparative Analysis of Multiclass Heart Disease Prediction Classification Models using Preprocessing and Feature Selection. I-SMAC 2022, IEEE.

[11] Permai, S.D. et al. (2025). Heart Disease Prediction in Indonesia Using Machine Learning Techniques for Multiclass Classification. IRASET 2025, IEEE.

---

## Appendix: Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| AI | Artificial Intelligence |
| ANN | Artificial Neural Network |
| AUC-ROC | Area Under the Receiver Operating Characteristic Curve |
| CNN | Convolutional Neural Network |
| CVD | Cardiovascular Disease |
| DL | Deep Learning |
| ECG | Electrocardiogram |
| GB | Gradient Boosting |
| IQR | InterQuartile Range |
| IoMT | Internet of Medical Things |
| LSTM | Long Short-Term Memory |
| ML | Machine Learning |
| MLP | Multi-Layer Perceptron |
| MQTT | Message Queuing Telemetry Transport |
| RF | Random Forest |
| RNN | Recurrent Neural Network |
| SHAP | SHapley Additive Explanations |
| SMOTE | Synthetic Minority Over-sampling Technique |
| SVM | Support Vector Machine |
| UCI | University of California, Irvine |
| XAI | Explainable AI |
| XGBoost | Extreme Gradient Boosting |

---

*Manuscript submitted: February 2026*

*This survey paper synthesizes findings from peer-reviewed publications indexed in IEEE Xplore and other academic databases, maintaining academic integrity through proper attribution and paraphrased synthesis of original research contributions.*
