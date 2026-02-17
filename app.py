from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
import os, traceback, threading
from flask_mail import Mail, Message

# --- FLAT IMPORTS (No folders needed) ---
from config import TEMP_DIR
from helpers import cleanup_folder_older_than
from merge_service import merge_pdfs
from split_service import split_pdf_single
from compress_service import compress_pdf
from convert_service import images_to_pdf, pdf_to_jpg, pdf_to_word, generate_pptx, office_to_pdf
from security_service import protect_pdf, unlock_pdf
from ocr_service import ocr_pdf
from rotate_service import rotate_pdf
from watermark_service import add_watermark

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

os.makedirs(TEMP_DIR, exist_ok=True)

def start_cleanup_worker():
    def worker():
        import time
        while True:
            cleanup_folder_older_than(3600)
            time.sleep(60*30)
    t = threading.Thread(target=worker, daemon=True)
    t.start()

start_cleanup_worker()

@app.route("/")
def home():
    return render_template("index.html")

# API Endpoints
@app.route("/api/merge", methods=["POST"])
def api_merge():
    try:
        files = request.files.getlist("files")
        if not files: return jsonify({"error": "No files"}), 400
        outpath = merge_pdfs(files)
        return send_file(outpath, as_attachment=True)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/split", methods=["POST"])
def api_split():
    try:
        file = request.files.get("file")
        page = int(request.form.get("page", 0))
        out = split_pdf_single(file, page_index=page)
        return send_file(out, as_attachment=True)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/compress", methods=["POST"])
def api_compress():
    try:
        file = request.files.get("file")
        out = compress_pdf(file)
        return send_file(out, as_attachment=True)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/img2pdf", methods=["POST"])
def api_img2pdf():
    try:
        files = request.files.getlist("files")
        out = images_to_pdf(files)
        return send_file(out, as_attachment=True)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/ppt_gen", methods=["POST"])
def api_ppt_gen():
    try:
        topic = request.form.get("topic", "Built-Theory")
        details = request.form.get("details", "")
        out = generate_pptx(topic, details)
        return send_file(out, as_attachment=True)
    except Exception as e: return jsonify({"error": str(e)}), 500

# Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'built.theory.official@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'
mail = Mail(app)

@app.route("/api/payment-success", methods=["POST"])
def payment_success_email():
    data = request.json
    msg = Message("Built-Theory PRO Unlocked!",
                  sender="built.theory.official@gmail.com",
                  recipients=[data['email']])
    msg.body = f"Payment of ₹{data['amount']} successful. 10GB limits active."
    mail.send(msg)
    return jsonify({"status": "sent"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
