from flask import Flask, render_template, request, send_file, jsonify
from flask_cors import CORS
import os, traceback, threading
from config import TEMP_DIR, USE_ASYNC
from services.helpers import cleanup_folder_older_than
from services.merge_service import merge_pdfs
from services.split_service import split_pdf_single
from services.compress_service import compress_pdf
from services.convert_service import images_to_pdf, pdf_to_jpg, pdf_to_word, generate_pptx
from services.security_service import protect_pdf, unlock_pdf
from services.ocr_service import ocr_pdf
from services.rotate_service import rotate_pdf
from services.watermark_service import add_watermark
from services.office_service import word_to_pdf, excel_to_pdf, ppt_to_pdf
from flask_mail import Mail, Message


app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

os.makedirs(TEMP_DIR, exist_ok=True)

# Periodic cleanup thread (simple)
def start_cleanup_worker():
    def worker():
        import time
        while True:
            cleanup_folder_older_than(3600)  # delete files older than 1 hour
            time.sleep(60*30)
    t = threading.Thread(target=worker, daemon=True)
    t.start()

start_cleanup_worker()

# ---------- Pages ----------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/merge")
def merge_page():
    return render_template("merge.html")

# ---------- API endpoints ----------
@app.route("/api/merge", methods=["POST"])
def api_merge():
    try:
        # We expect the frontend to pass files in desired order (FormData append order)
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

@app.route("/api/rotate", methods=["POST"])
def api_rotate():
    try:
        file = request.files.get("file")
        direction = request.form.get("direction", 90)
        out = rotate_pdf(file, direction)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/watermark", methods=["POST"])
def api_watermark():
    try:
        file = request.files.get("file")
        text = request.form.get("text", "Built-Theory")
        out = add_watermark(file, text)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/word2pdf", methods=["POST"])
def api_word2pdf():
    try:
        file = request.files.get("file")
        out = word_to_pdf(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/excel2pdf", methods=["POST"])
def api_excel2pdf():
    try:
        file = request.files.get("file")
        out = excel_to_pdf(file)
        return send_file(out, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Generic placeholder for other 20+ endpoints:
@app.route("/api/<tool>", methods=["POST"])
def api_tool_placeholder(tool):
    # You can expand each tool; for now this route returns a helpful message
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
    import gunicorn.app.base
    # development run
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
