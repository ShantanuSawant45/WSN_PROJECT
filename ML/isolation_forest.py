

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("  ISOLATION FOREST - WSN FAULT DETECTION SYSTEM")
print("  IIIT Vadodara - Group 1 Project")
print("=" * 60)

print("\n[STEP 1] Generating Simulated Sensor Data...")

np.random.seed(42)

NUM_SAMPLES = 1000
NUM_FAULTY  = 50  # 5% anomalies

normal_temperature    = np.random.normal(loc=30, scale=3, size=NUM_SAMPLES)
normal_humidity       = np.random.normal(loc=60, scale=5, size=NUM_SAMPLES)
normal_soil_moisture  = np.random.normal(loc=40, scale=4, size=NUM_SAMPLES)
normal_light          = np.random.normal(loc=500, scale=50, size=NUM_SAMPLES)
normal_pressure       = np.random.normal(loc=1013, scale=5, size=NUM_SAMPLES)

faulty_temperature    = np.random.uniform(low=70, high=100, size=NUM_FAULTY)
faulty_humidity       = np.random.uniform(low=95, high=100, size=NUM_FAULTY)
faulty_soil_moisture  = np.random.uniform(low=90, high=100, size=NUM_FAULTY)
faulty_light          = np.random.uniform(low=1000, high=2000, size=NUM_FAULTY)
faulty_pressure       = np.random.uniform(low=800, high=900, size=NUM_FAULTY)

temperature   = np.concatenate([normal_temperature, faulty_temperature])
humidity      = np.concatenate([normal_humidity, faulty_humidity])
soil_moisture = np.concatenate([normal_soil_moisture, faulty_soil_moisture])
light         = np.concatenate([normal_light, faulty_light])
pressure      = np.concatenate([normal_pressure, faulty_pressure])

labels = np.concatenate([
    np.ones(NUM_SAMPLES),   # Normal = 1
    -np.ones(NUM_FAULTY)    # Faulty = -1
])

df = pd.DataFrame({
    'temperature'   : temperature,
    'humidity'      : humidity,
    'soil_moisture' : soil_moisture,
    'light'         : light,
    'pressure'      : pressure,
    'true_label'    : labels
})

df = df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"  Total data points     : {len(df)}")
print(f"  Normal readings       : {int((df['true_label'] == 1).sum())}")
print(f"  Faulty readings       : {int((df['true_label'] == -1).sum())}")
print(f"  Features used         : temperature, humidity, soil_moisture, light, pressure")

print("\n[STEP 2] Preprocessing Data...")

FEATURES = ['temperature', 'humidity', 'soil_moisture', 'light', 'pressure']

X = df[FEATURES]
y = df['true_label']

missing = X.isnull().sum()
print(f"  Missing values        : {missing.sum()} (None found)")

print("\n  Dataset Statistics:")
print(df[FEATURES].describe().round(2).to_string())

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled_df = pd.DataFrame(X_scaled, columns=FEATURES)

print("\n  Data scaling done using StandardScaler")
print("  (Mean=0, Std=1 for all features)")

print("\n[STEP 3] Splitting Data into Train and Test sets...")

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y,
    test_size=0.2,
    random_state=42
)

print(f"  Training samples  : {len(X_train)}")
print(f"  Testing samples   : {len(X_test)}")

print("\n[STEP 4] Training Isolation Forest Model...")

CONTAMINATION = 0.05   # 5% of data expected to be faulty
N_ESTIMATORS  = 100    # Number of isolation trees
MAX_SAMPLES   = 'auto' # Samples per tree
RANDOM_STATE  = 42

isolation_forest = IsolationForest(
    n_estimators  = N_ESTIMATORS,
    contamination = CONTAMINATION,
    max_samples   = MAX_SAMPLES,
    random_state  = RANDOM_STATE,
    verbose       = 0
)

isolation_forest.fit(X_train)
print("  Model training complete!")
print(f"  Number of trees (estimators) : {N_ESTIMATORS}")
print(f"  Contamination rate           : {CONTAMINATION * 100}%")

print("\n[STEP 5] Running Anomaly Detection on Test Data...")

y_pred = isolation_forest.predict(X_test)

anomaly_scores = isolation_forest.decision_function(X_test)

normal_count  = (y_pred == 1).sum()
faulty_count  = (y_pred == -1).sum()

print(f"  Total test samples    : {len(y_pred)}")
print(f"  Predicted Normal      : {normal_count}")
print(f"  Predicted Faulty      : {faulty_count}")

df['predicted_label']  = isolation_forest.predict(X_scaled)
df['anomaly_score']    = isolation_forest.decision_function(X_scaled)
df['is_anomaly']       = df['predicted_label'].apply(lambda x: 'FAULT' if x == -1 else 'NORMAL')

print("\n[STEP 6] Evaluating Model Performance...")

print("\n  Classification Report:")
print("  " + "-" * 50)
report = classification_report(
    y_test, y_pred,
    target_names=['Faulty (-1)', 'Normal (1)']
)
for line in report.split('\n'):
    print("  " + line)

cm = confusion_matrix(y_test, y_pred)
print("\n  Confusion Matrix:")
print("  " + "-" * 30)
print(f"  True Normal  predicted Normal  : {cm[1][1]}")
print(f"  True Normal  predicted Faulty  : {cm[1][0]}")
print(f"  True Faulty  predicted Faulty  : {cm[0][0]}")
print(f"  True Faulty  predicted Normal  : {cm[0][1]}")

print("\n[STEP 7] Generating Visualizations...")

fig, axes = plt.subplots(3, 2, figsize=(14, 16))
fig.suptitle(
    'Isolation Forest - WSN Fault Detection\nIIIT Vadodara - Group 1',
    fontsize=14, fontweight='bold', y=0.98
)

colors = {'NORMAL': '#2196F3', 'FAULT': '#F44336'}

ax1 = axes[0, 0]
for label, group in df.groupby('is_anomaly'):
    ax1.scatter(
        group.index, group['temperature'],
        c=colors[label], label=label, alpha=0.6, s=15
    )
ax1.set_title('Temperature Readings')
ax1.set_xlabel('Sample Index')
ax1.set_ylabel('Temperature (°C)')
ax1.legend()
ax1.grid(True, alpha=0.3)

ax2 = axes[0, 1]
for label, group in df.groupby('is_anomaly'):
    ax2.scatter(
        group.index, group['humidity'],
        c=colors[label], label=label, alpha=0.6, s=15
    )
ax2.set_title('Humidity Readings')
ax2.set_xlabel('Sample Index')
ax2.set_ylabel('Humidity (%)')
ax2.legend()
ax2.grid(True, alpha=0.3)

ax3 = axes[1, 0]
for label, group in df.groupby('is_anomaly'):
    ax3.scatter(
        group.index, group['soil_moisture'],
        c=colors[label], label=label, alpha=0.6, s=15
    )
ax3.set_title('Soil Moisture Readings')
ax3.set_xlabel('Sample Index')
ax3.set_ylabel('Soil Moisture (%)')
ax3.legend()
ax3.grid(True, alpha=0.3)

ax4 = axes[1, 1]
ax4.hist(
    df[df['is_anomaly'] == 'NORMAL']['anomaly_score'],
    bins=40, color='#2196F3', alpha=0.7, label='Normal'
)
ax4.hist(
    df[df['is_anomaly'] == 'FAULT']['anomaly_score'],
    bins=40, color='#F44336', alpha=0.7, label='Fault'
)
ax4.axvline(x=0, color='black', linestyle='--', linewidth=1.5, label='Threshold')
ax4.set_title('Anomaly Score Distribution')
ax4.set_xlabel('Anomaly Score (lower = more anomalous)')
ax4.set_ylabel('Frequency')
ax4.legend()
ax4.grid(True, alpha=0.3)

ax5 = axes[2, 0]
for label, group in df.groupby('is_anomaly'):
    ax5.scatter(
        group['temperature'], group['humidity'],
        c=colors[label], label=label, alpha=0.6, s=15
    )
ax5.set_title('Temperature vs Humidity')
ax5.set_xlabel('Temperature (°C)')
ax5.set_ylabel('Humidity (%)')
ax5.legend()
ax5.grid(True, alpha=0.3)

ax6 = axes[2, 1]
sns.heatmap(
    cm,
    annot=True, fmt='d',
    cmap='Blues',
    xticklabels=['Predicted Faulty', 'Predicted Normal'],
    yticklabels=['Actual Faulty', 'Actual Normal'],
    ax=ax6
)
ax6.set_title('Confusion Matrix')

plt.tight_layout()
plt.savefig('/mnt/user-data/outputs/isolation_forest_results.png', dpi=150, bbox_inches='tight')
print("  Plots saved successfully!")

print("\n[STEP 8] Real-Time Fault Detection Simulation...")
print("  " + "=" * 50)

def detect_fault(temperature, humidity, soil_moisture, light, pressure):
    """
    Function to detect fault in a single sensor reading.
    Returns: 'FAULT DETECTED' or 'NORMAL'
    """
    reading = np.array([[temperature, humidity, soil_moisture, light, pressure]])
    reading_scaled = scaler.transform(reading)
    prediction = isolation_forest.predict(reading_scaled)
    score = isolation_forest.decision_function(reading_scaled)[0]

    status = "🔴 FAULT DETECTED" if prediction[0] == -1 else "🟢 NORMAL"
    return status, round(score, 4)

print("\n  Test 1 - Normal Sensor Reading:")
status, score = detect_fault(
    temperature=31,
    humidity=62,
    soil_moisture=41,
    light=510,
    pressure=1015
)
print(f"  Input  : Temp=31°C | Humidity=62% | Soil=41% | Light=510 | Pressure=1015")
print(f"  Result : {status}")
print(f"  Score  : {score} (Negative = anomaly, Positive = normal)")

print("\n  Test 2 - Faulty Sensor Reading:")
status, score = detect_fault(
    temperature=95,
    humidity=98,
    soil_moisture=97,
    light=1800,
    pressure=850
)
print(f"  Input  : Temp=95°C | Humidity=98% | Soil=97% | Light=1800 | Pressure=850")
print(f"  Result : {status}")
print(f"  Score  : {score} (Negative = anomaly, Positive = normal)")

print("\n  Test 3 - Borderline Sensor Reading:")
status, score = detect_fault(
    temperature=52,
    humidity=80,
    soil_moisture=70,
    light=750,
    pressure=990
)
print(f"  Input  : Temp=52°C | Humidity=80% | Soil=70% | Light=750 | Pressure=990")
print(f"  Result : {status}")
print(f"  Score  : {score} (Negative = anomaly, Positive = normal)")

print("\n[STEP 9] Saving Results to CSV...")

output_df = df[['temperature', 'humidity', 'soil_moisture',
                 'light', 'pressure', 'anomaly_score',
                 'predicted_label', 'is_anomaly', 'true_label']]

output_df.to_csv('/mnt/user-data/outputs/fault_detection_results.csv', index=False)
print("  Results saved to: fault_detection_results.csv")

print("\n  Sample of Detected Faults:")
print("  " + "-" * 60)
faults = df[df['is_anomaly'] == 'FAULT'][
    ['temperature', 'humidity', 'soil_moisture', 'anomaly_score']
].head(5).round(2)
print(faults.to_string(index=False))

print("\n" + "=" * 60)
print("  FINAL SUMMARY")
print("=" * 60)

total       = len(df)
faults_det  = (df['is_anomaly'] == 'FAULT').sum()
normal_det  = (df['is_anomaly'] == 'NORMAL').sum()
accuracy    = round(
    (df['true_label'] == df['predicted_label']).sum() / total * 100, 2
)

print(f"  Algorithm          : Isolation Forest")
print(f"  Total Samples      : {total}")
print(f"  Normal Detected    : {normal_det}")
print(f"  Faults Detected    : {faults_det}")
print(f"  Accuracy           : {accuracy}%")
print(f"  Contamination Set  : {CONTAMINATION * 100}%")
print(f"  Trees Used         : {N_ESTIMATORS}")
print(f"  Features           : {', '.join(FEATURES)}")
print("\n  Files Generated:")
print("  - isolation_forest_results.png  (Graphs)")
print("  - fault_detection_results.csv   (Data with predictions)")
print("\n  Project: ML-Based Fault Detection in WSN")
print("  College: IIIT Vadodara - Group 1")
print("=" * 60)
print("\n✅ Program executed successfully!")