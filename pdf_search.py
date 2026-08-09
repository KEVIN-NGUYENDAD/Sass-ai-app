# pdf_search.py - semantic search via TF-IDF + cosine similarity
#
# Upgrade from the previous raw keyword-overlap-count scoring: TF-IDF
# weights terms by how distinctive they are across all indexed pages (a
# word that appears on every page barely counts, a word specific to one
# page counts a lot), and cosine similarity accounts for query/page length
# instead of just raw word-hit counts. This catches paraphrased questions
# ("thuốc sinh học tương tự" vs "biosimilar") much better than exact
# substring matching did, without needing a heavy embedding model that
# wouldn't fit Render's free-tier build/memory limits.

from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer

PDF_FILES = [
    "B1_Hoa-Duoc-Biopharmaceuticals-2027.pdf",
    "B2_Duoc ly-Biopharmaceuticals-2026.pdf"
]

# Below this cosine-similarity score, treat the match as noise rather than
# a real answer. Tuned empirically against the two PDFs in this repo —
# short queries against long pages rarely score above ~0.5 even for a
# genuinely relevant page, so this is deliberately low.
MIN_SCORE = 0.05

_index = None  # lazily built: {"vectorizer", "matrix", "pages": [...]}


def _load_pages():
    pages = []
    for pdf_file in PDF_FILES:
        try:
            reader = PdfReader(pdf_file)

            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text()

                if not text or not text.strip():
                    continue

                pages.append({
                    "file": pdf_file,
                    "page": page_number,
                    "content": text,
                })

        except Exception as e:
            print(f"Error reading {pdf_file}: {e}")
            continue

    return pages


def _build_index():
    global _index

    if _index is not None:
        return _index

    pages = _load_pages()

    if not pages:
        _index = {"vectorizer": None, "matrix": None, "pages": []}
        return _index

    vectorizer = TfidfVectorizer(max_df=0.95, min_df=1)
    matrix = vectorizer.fit_transform([p["content"] for p in pages])

    _index = {"vectorizer": vectorizer, "matrix": matrix, "pages": pages}
    return _index


def search_pdf(query):
    """
    Semantic search for query text across PDF_FILES using TF-IDF cosine
    similarity.
    Return: {file, page, content, found, score} OR {found: False, message: "..."}
    """
    if not query or query.strip() == "":
        return {"found": False, "message": "Empty query"}

    index = _build_index()

    if not index["pages"]:
        return {"found": False, "message": "No PDF content indexed"}

    query_vector = index["vectorizer"].transform([query])

    # TfidfVectorizer output is L2-normalized by default, so the dot
    # product between query and page vectors *is* cosine similarity —
    # no need for a separate normalization step.
    scores = (index["matrix"] @ query_vector.T).toarray().ravel()

    best_idx = int(scores.argmax())
    best_score = float(scores[best_idx])

    if best_score < MIN_SCORE:
        return {
            "found": False,
            "message": f"NOT FOUND in PDFs: '{query}'"
        }

    page = index["pages"][best_idx]

    return {
        "found": True,
        "file": page["file"],
        "page": page["page"],
        "content": page["content"][:2000],
        "score": best_score,
    }
