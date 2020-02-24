import random
import json
import spacy
from openpyxl import load_workbook
import numpy

NLP = spacy.load('de')

def custom_sentence_boundaries(doc):
    not_sentence_boundary = [":", "°", ";", "±"]
    for token in doc[:-1]:
        if token.text in not_sentence_boundary:
            doc[token.i+1].is_sent_start = False
        if token.text == "°":
            doc[token.i].is_sent_start = False
        if token.text == "…" and doc[token.i-1].text == "[" and doc[token.i+1].text == "]": # ellipses in a quote are not a new sentence
            doc[token.i+1].is_sent_start = False
    return doc

NLP.add_pipe(custom_sentence_boundaries, before="parser")

# TODO: make this easier editable
DATA_PATH = 'data.xlsx'
SHEET_NAME = 'paragraphs'
TEXT_COLUMN = 'B'
OUTPUT_PATH_ITEMS = 'data-processing/processed/items.json'
OUTPUT_PATH_SESSIONS = 'data-processing/processed/sessions.json'
INCLUDE_ALL_SENTENCES = True
CLOZES_PER_TEXT = 5
ALTERNATIVE_SUGGESTIONS_PER_CLOZE = 4
ITEMS_PER_SESSION = 3

WORKBOOK = load_workbook(DATA_PATH)
SHEET = WORKBOOK[SHEET_NAME]


def get_parsed_texts():
    column = SHEET[TEXT_COLUMN]
    return [NLP(cell.value) for cell in column[1:]] # column[0] is the column header

def tag_parts_of_speech(text):
    return [{
        "word": word.orth_,
        "type": word.pos_
    } for word in text]

def separate_sentences(text):
    return [sentence.text for sentence in text.sents]

def remove_punctuation(parts_of_speech):
    return [token for token in parts_of_speech if token['type'] != 'PUNCT']

def get_clozes(parts_of_speech, alternative_pool=None):
    if alternative_pool is None:
        alternative_pool = parts_of_speech

    noun_indices = [i for i, token in enumerate(parts_of_speech) if token['type'] == 'NOUN']
    cloze_indices = random.sample(noun_indices, min(len(noun_indices), CLOZES_PER_TEXT))

    clozes = []

    for i in cloze_indices:
        original = parts_of_speech[i]['word']
        alternative_indices = [index for index, token in enumerate(alternative_pool) if token['type'] == 'NOUN' and token['word'] != original]
        suggestion_amount = min(len(alternative_indices), ALTERNATIVE_SUGGESTIONS_PER_CLOZE)
        suggestion_indices = random.sample(alternative_indices, suggestion_amount)
        clozes.append({
            'wordIndex': i,
            'original': original,
            'alternativeSuggestions': [alternative_pool[altIndex]['word'] for altIndex in suggestion_indices]
        })

    return clozes

def get_sessions(item_ids):
    random.shuffle(item_ids)
    chunks = numpy.split(numpy.array(item_ids), ITEMS_PER_SESSION)
    return [{
        "_id": str(i+1),
        "items": chunk.tolist()
    } for i, chunk in enumerate(chunks)]

def main():
    texts = get_parsed_texts()
    item_documents = []
    all_ids = []

    for index, text in enumerate(texts):
        sentences = separate_sentences(text)
        parts_of_speech = tag_parts_of_speech(text)
        paragraph_id = 'par_{}'.format(index+1)

        paragraph_document = {
            "_id": paragraph_id,
            "type": "paragraph",
            "text": text.text,
            "sentences": sentences,
            "partsOfSpeech": parts_of_speech,
            "clozes": get_clozes(remove_punctuation(parts_of_speech))
        }

        item_documents.append(paragraph_document)
        all_ids.append(paragraph_id)

        if INCLUDE_ALL_SENTENCES:
            # add an itemDoc for each sentence
            for sentence_index, sentence in enumerate(sentences):
                sentence_parts_of_speech = tag_parts_of_speech(NLP(sentence))
                sentence_id = "sent_{}-{}".format(index + 1, sentence_index + 1)

                sentence_document = {
                    "_id": sentence_id,
                    "type": "sentence",
                    "text": sentence,
                    "enclosingParagraph": text.text,
                    "partsOfSpeech": sentence_parts_of_speech,
                    "clozes": get_clozes(remove_punctuation(sentence_parts_of_speech), alternative_pool=parts_of_speech)
                }
                item_documents.append(sentence_document)
                all_ids.append(sentence_id)

    session_documents = get_sessions(all_ids)

    with open(OUTPUT_PATH_ITEMS, 'w', encoding='utf-8') as file:
        json.dump({'docs': item_documents}, file, ensure_ascii=False, indent=2)

    with open(OUTPUT_PATH_SESSIONS, 'w', encoding='utf-8') as file:
        json.dump({'docs': session_documents}, file, ensure_ascii=False, indent=2)

    print('Your items have been processed and are ready to be uploaded to your database. Run \n \
      curl -X POST YOUR-COUCH-URL-HERE/items/_bulk_docs -H \'Content-Type: application/json\' -d @{}\n \
      to automatically upload them.'.format(OUTPUT_PATH_ITEMS))
    # TODO: this does not work if /items does not exist! Or if the documents with the specific IDs already exist
    # TODO: upload session docs

main()
