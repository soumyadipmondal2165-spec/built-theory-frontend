# Built-Theory PDF Tools — Working Principles & iLovePDF-style Implementation Analysis

This document maps each listed tool in Built-Theory to:
- **Purpose** (what user wants)
- **Working principle** (how engines usually work)
- **Current status in this repo**
- **Implementation path for production parity**

## 1) Edit Tools

### Merge PDF
- Purpose: combine many PDFs into one ordered file.
- Principle: parse source PDFs, copy page objects, re-index xref, write consolidated output.
- Status: **Implemented** (client-side `pdf-lib`).
- Next: add drag-sort ordering, per-file page range selection, and preview before merge.

### Split PDF
- Purpose: break one PDF into many outputs by ranges/rules.
- Principle: clone selected pages into new PDF documents.
- Status: **Implemented** (range split).
- Next: add split-by-size, split-by-bookmarks, split every N pages.

### Remove pages
- Purpose: delete unwanted pages.
- Principle: create new PDF excluding selected page indices.
- Status: **Implemented**.
- Next: multi-select shortcuts + undo stack.

### Extract pages
- Purpose: keep only selected pages as new file.
- Principle: clone chosen page indices into output.
- Status: **Implemented** in `ToolDetail` flow.
- Next: export each page separately (zip option).

### Organize PDF
- Purpose: reorder, rotate, remove pages visually.
- Principle: thumbnail rendering + page operation list + rebuild document.
- Status: **Implemented (basic)**.
- Next: drag-and-drop ordering persistence + duplicate pages.

### Rotate PDF
- Purpose: rotate pages by 90/180/270.
- Principle: adjust page rotation metadata or content transform.
- Status: **Implemented** (90-degree rotation pipeline).
- Next: per-page rotation options.

### Add watermark
- Purpose: stamp text/image watermark across pages.
- Principle: draw layer over page with opacity, angle, and position.
- Status: **Implemented (text watermark)**.
- Next: image watermark + per-page rules + tiling.

### Add page numbers
- Purpose: add page numbering formats and positions.
- Principle: render text layer per page using numbering templates.
- Status: Not implemented.
- Next: add numbering format engine and margin presets.

### Crop PDF
- Purpose: crop page visible area.
- Principle: update crop/media boxes or render-transform for selected boxes.
- Status: Not implemented.
- Next: add visual crop rectangle with preview.

### Edit PDF
- Purpose: annotate/add text/shapes/signatures.
- Principle: write annotations/content streams and embed fonts/images.
- Status: Not implemented.
- Next: canvas annotation layer + export flattening.

### Sign PDF
- Purpose: place e-signature or request signatures.
- Principle: draw signature appearance + optional cryptographic signing pipeline.
- Status: Not implemented.
- Next: start with visible signature image/text; digital cert signing requires server/PKI.

### Scan to PDF
- Purpose: convert camera captures into cleaned PDFs.
- Principle: image capture, perspective correction, thresholding, PDF assembly.
- Status: Not implemented.
- Next: add camera capture with edge detection.

## 2) Convert Tools

### JPG to PDF
- Purpose: convert one or multiple images to PDF.
- Principle: embed images as pages and preserve dimensions.
- Status: **Implemented**.
- Next: add PNG/webp/tiff pipeline and page sizing presets.

### Word/Excel/PPT to PDF
- Purpose: office file to PDF conversion.
- Principle: high-fidelity conversion requires Office renderer (server-side/libreoffice/cloud API).
- Status: Not implemented.
- Next: backend microservice queue with secure temporary storage.

### HTML to PDF
- Purpose: web page to print-ready PDF.
- Principle: headless browser print engine.
- Status: Not implemented.
- Next: server-side Playwright/Chromium render endpoint.

### PDF to JPG
- Purpose: convert pages into images.
- Principle: rasterize PDF pages at selected DPI.
- Status: Not implemented.
- Next: use `pdfjs-dist` page raster + zip packaging.

### PDF to Word/PPT/Excel
- Purpose: recover editable structure from PDF.
- Principle: OCR + layout detection + semantic reconstruction.
- Status: Not implemented.
- Next: AI + OCR backend services.

### PDF to PDF/A
- Purpose: archival compliant PDF.
- Principle: normalize fonts/colors/metadata and conformance checks.
- Status: Not implemented.
- Next: dedicated compliance engine (often server-side).

## 3) Optimize/Security Tools

### Compress PDF
- Purpose: reduce file size.
- Principle: object stream optimization, image recompression, font subsetting.
- Status: **Implemented (basic)**.
- Next: real image recompression profiles and quality estimator.

### OCR PDF
- Purpose: searchable text from scanned docs.
- Principle: OCR text extraction + text layer injection.
- Status: Not implemented.
- Next: worker/server OCR (Tesseract or cloud OCR) + confidence review UI.

### Repair PDF
- Purpose: recover damaged PDF structure.
- Principle: cross-reference reconstruction and object salvage.
- Status: Not implemented.
- Next: robust parser/recovery engine on backend.

### Unlock PDF
- Purpose: remove permissions/password when authorized.
- Principle: decrypt with password then save unprotected copy.
- Status: **Implemented (password path)**.
- Next: improve error handling for permissions-only cases.

### Protect PDF
- Purpose: add encryption/permission restrictions.
- Principle: encrypt output with user/owner passwords and permission bits.
- Status: **Partially implemented** (save only).
- Next: add true encryption flow using a library/service supporting browser-safe encryption.

## Production Parity Architecture (iLovePDF-style tools working, not UI copy)

To achieve same-depth tool behavior, use this stack:
1. **Client app**: upload UX, page previews, settings panels, download handling.
2. **Edge upload + queue**: signed uploads, job queue, resumable handling.
3. **Workers by tool class**:
   - PDF structural worker (merge/split/rotate/organize/remove/extract/watermark)
   - Conversion worker (office/html)
   - OCR/AI worker
   - Security worker (protect/unlock/sign)
4. **Temporary object storage**: encrypted-at-rest + short TTL cleanup.
5. **Job orchestration API**: start job, poll status, retrieve result.
6. **Observability**: per-tool metrics, failure reasons, retries.

This separation is required because many high-fidelity conversion and compliance tools cannot be reliably done only in-browser.
