import sys
import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn.metrics import accuracy_score


def predict_diabetes(input_data):
    df = pd.read_csv('/Users/zine/Downloads/diabetes.csv')
    df = df.drop('DiabetesPedigreeFunction', axis='columns')
    X = df.drop('Outcome', axis=1).values
    y = df['Outcome'].values
    scaler = StandardScaler()
    scaler.fit(X)
    standardized_X = scaler.transform(X)
    X_train, X_test, y_train, y_test = train_test_split(
        standardized_X, y, test_size=0.2, stratify=y, random_state=2)
    classifier = svm.SVC(kernel='linear')
    classifier.fit(X_train, y_train)
    input_array = np.asarray(input_data)
    reshaped_input_array = input_array.reshape(1, -1)
    x_check = scaler.transform(reshaped_input_array)
    y_check = classifier.predict(x_check)
    if y_check[0] == 0:
        return 0
    else:
        return 1


input_str = sys.argv[1]
input_data = json.loads(input_str)['input_data']
result = predict_diabetes(input_data)
print(result)
