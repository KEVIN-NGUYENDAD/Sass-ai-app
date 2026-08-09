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

import re

from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer

PDF_FILES = [
    "B1_Hoa-Duoc-Biopharmaceuticals-2027.pdf",
    "B2_Duoc ly-Biopharmaceuticals-2026.pdf"
]

# Two similarity-score floors, not one - see the "signal term" comment
# below for why. TF-IDF score alone is NOT a reliable relevance signal on
# these two PDFs: measured against real test questions, "Tác dụng phụ
# thường gặp của Amoxicillin là gì?" (Amoxicillin appears zero times in
# either PDF) scored HIGHER (0.326) than a genuinely on-topic query like
# "biosimilar là gì" (0.182) - the score was driven by generic Vietnamese
# question phrasing shared with unrelated pages ("tác dụng phụ" also
# appears on a TNF-inhibitor side-effects slide), not by real relevance to
# Amoxicillin.
#
# MIN_SIGNAL_LEN: when the query contains a "signal term" - a plain-ASCII
# token of this many+ characters, which in practice means a drug/technical
# name rather than accented Vietnamese phrasing - we already independently
# verify that term literally appears on the candidate page (see below), so
# the score just needs to clear a low bar (MIN_SCORE_WITH_SIGNAL) to rule
# out a near-zero fluke.
#
# MIN_SCORE: for queries with NO signal term (pure Vietnamese conceptual
# phrasing, nothing to literally verify), the score is the *only* defense
# against a confident wrong answer, and empirically it's a leaky one: real
# off-topic questions like "Bệnh nhân tiểu đường có thể dùng thuốc cảm nào
# an toàn?" scored 0.19, barely below genuinely on-topic questions like
# "thuốc sinh học tương tự" at 0.22 - these two PDFs are lecture-slide Q&A
# style throughout, so generic Vietnamese medical phrasing overlaps a lot
# regardless of topic. 0.20 was picked as the highest value that still
# keeps every known-relevant no-signal test query while rejecting every
# known off-topic one, but treat it as an approximate heuristic, not a
# guarantee - a differently-phrased off-topic question could still slip
# through, or a differently-phrased on-topic one could get rejected.
MIN_SIGNAL_LEN = 5
MIN_SCORE_WITH_SIGNAL = 0.05
MIN_SCORE = 0.20


def _extract_signal_terms(query):
    tokens = re.findall(r"[A-Za-z]+", query)
    return [t.lower() for t in tokens if len(t) >= MIN_SIGNAL_LEN]

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

    # If the query names a specific drug/technical term, only consider
    # pages that actually contain it - see MIN_SIGNAL_LEN comment above for
    # why the raw TF-IDF score can't be trusted alone here. This is checked
    # across every page (not just whatever TF-IDF ranked first), so a term
    # that appears on a page TF-IDF didn't rank highest still gets found.
    signal_terms = _extract_signal_terms(query)
    candidate_indices = range(len(index["pages"]))
    min_score = MIN_SCORE

    if signal_terms:
        matching_indices = [
            i for i in candidate_indices
            if any(term in index["pages"][i]["content"].lower() for term in signal_terms)
        ]
        if not matching_indices:
            return {
                "found": False,
                "message": (
                    f"NOT FOUND: query mentions {signal_terms} which do not "
                    f"appear anywhere in the indexed PDFs"
                ),
            }
        candidate_indices = matching_indices
        min_score = MIN_SCORE_WITH_SIGNAL

    best_idx = max(candidate_indices, key=lambda i: scores[i])
    best_score = float(scores[best_idx])

    if best_score < min_score:
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
