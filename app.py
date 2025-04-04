from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import joblib
import pandas as pd

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config['DEBUG'] = os.environ.get('FLASK_DEBUG')

rf_close_model = joblib.load('optimized_rf_model.pkl')
scaler_close = joblib.load('scaler.pkl')
pca_close = joblib.load('pca.pkl')

# 2. Bull/Bear Classifier
rf_bullbear = joblib.load('optimized_rf_model_bullbear_lda.pkl')
scaler_bullbear = joblib.load('scalerbullbear.pkl')
lda_bullbear = joblib.load('lda_transformer_bullbear.pkl')

# 3. Volatility Prediction
rf_volatility = joblib.load('volatility_random_forest_model.pkl')
scaler_volatility = joblib.load('volatility_scaler.pkl')

# 4. K-Means Clustering
kmeans = joblib.load('kmeans_model.pkl')
scaler_kmeans = joblib.load('scaler_kmeans.pkl')

# 📌 Define required features per endpoint
base_features = ['open', 'high', 'low', 'volume', 'moving_average_5', 'rsi']
features_with_close = ['open', 'high', 'low', 'close', 'volume', 'moving_average_5', 'rsi']


@app.route('/')
def index():
    return "🚀 Unified Stock Intelligence API is running!"


@app.route('/predict_close', methods=['POST'])
def predict_close():
    try:
        data = request.get_json(force=True)
        if not all(f in data for f in base_features):
            return jsonify({'error': 'Missing input features'}), 400
        input_df = pd.DataFrame([data])[base_features]
        X_scaled = scaler_close.transform(input_df)
        X_pca = pca_close.transform(X_scaled)
        prediction = rf_close_model.predict(X_pca)[0]
        return jsonify({'predicted_close_price': round(float(prediction), 4)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_bullbear', methods=['POST'])
def predict_bullbear():
    try:
        data = request.get_json(force=True)
        if not all(f in data for f in base_features):
            return jsonify({'error': 'Missing input features'}), 400
        input_df = pd.DataFrame([data])[base_features]
        scaled = scaler_bullbear.transform(input_df)
        lda_transformed = lda_bullbear.transform(scaled)
        prediction = rf_bullbear.predict(lda_transformed)[0]
        label = "Bullish 📈" if prediction == 1 else "Bearish 📉"
        return jsonify({'predicted_class': int(prediction), 'trend_label': label})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_volatility', methods=['POST'])
def predict_volatility():
    try:
        data = request.get_json(force=True)
        if not all(f in data for f in features_with_close):
            return jsonify({'error': 'Missing input features (with close)'}), 400
        input_df = pd.DataFrame([data])[features_with_close]
        scaled = scaler_volatility.transform(input_df)
        prediction = rf_volatility.predict(scaled)[0]
        return jsonify({'predicted_volatility': round(float(prediction), 6)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict_cluster', methods=['POST'])
def predict_cluster():
    try:
        data = request.get_json(force=True)
        if not all(f in data for f in features_with_close):
            return jsonify({'error': 'Missing input features (with close)'}), 400
        input_df = pd.DataFrame([data])[features_with_close]
        scaled = scaler_kmeans.transform(input_df)
        cluster = kmeans.predict(scaled)[0]  # ✅ Directly use scaled, NOT PCA-reduced
        return jsonify({'cluster_label': int(cluster)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run()