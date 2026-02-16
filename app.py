from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
import os, traceback, threading

# Import directly from the main folder now
from config import TEMP_DIR, USE_ASYNC
from helpers import cleanup_folder_older_than
from merge_service import merge_pdfs
from split_service import split_pdf_single
from compress_service import compress_pdf
from convert_service import images_to_pdf, pdf_to_jpg, pdf_to_word, generate_pptx
from security_service import protect_pdf, unlock_pdf
from ocr_service import ocr_pdf
from flask_mail import Mail, Message

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

os.makedirs(TEMP_DIR, exist_ok=True)

# Periodic cleanup thread
def start_cleanup_worker():
    def worker():
        import time
        while True:
            cleanup_folder_older_than(3600)  # delete files older than 1 hour
            time.sleep(60*30)
    t = threading.Thread(target=worker, daemon=True)
    t.start()

start_cleanup_worker()

@app.route("/")
def home():
    return render_template("index.html")

# API endpoints
@app.route("/api/merge", methods=["POST"])
def api_merge():
    try:
        files = request.files.getlist("files")
        if not files:
            return jsonify({"error": "No files"}), 400
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/compress", methods=["POST"])
def api_compress():
    try:
        file = request.files.get("file")
        out = compress_pdf(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/img2pdf", methods=["POST"])
def api_img2pdf():
    try:
        files = request.files.getlist("files")
        out = images_to_pdf(files)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pdf2jpg", methods=["POST"])
def api_pdf2jpg():
    try:
        file = request.files.get("file")
        out = pdf_to_jpg(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pdf2word", methods=["POST"])
def api_pdf2word():
    try:
        file = request.files.get("file")
        out = pdf_to_word(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ppt_gen", methods=["POST"])
def api_ppt_gen():
    try:
        topic = request.form.get("topic", "Built-Theory")
        details = request.form.get("details", "")
        out = generate_pptx(topic, details)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/protect", methods=["POST"])
def api_protect():
    try:
        file = request.files.get("file")
        pwd = request.form.get("password", "1234")
        out = protect_pdf(file, pwd)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/unlock", methods=["POST"])
def api_unlock():
    try:
        file = request.files.get("file")
        pwd = request.form.get("password", "")
        out = unlock_pdf(file, pwd)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ocr", methods=["POST"])
def api_ocr():
    try:
        file = request.files.get("file")
        out = ocr_pdf(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/<tool>", methods=["POST"])
def api_tool_placeholder(tool):
    supported = ["merge","split","compress","img2pdf","pdf2jpg","pdf2word","ppt_gen","protect","unlock","ocr"]
    if tool in supported:
        return jsonify({"error":"use dedicated endpoints"}), 400
    return jsonify({"message": f"'{tool}' endpoint is ready to be implemented on server side."}), 200

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'built.theory.official@gmail.com' # Your Email
app.config['MAIL_PASSWORD'] = 'your-app-password'
mail = Mail(app)

@app.route("/api/payment-success", methods=["POST"])
def payment_success_email():
    data = request.json
    msg = Message("Built-Theory PRO Unlocked!",
                  sender="built.theory.official@gmail.com",
                  recipients=[data['email']])
    msg.body = f"Hello! Your payment of ₹{data['amount']} was successful. 10GB limits are now active on your account."
    mail.send(msg)
    return jsonify({"status": "sent"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
