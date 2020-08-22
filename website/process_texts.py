import random
import json
import spacy
from openpyxl import load_workbook
import numpy
import math
import yaml

# load config
with open('website/config.yml') as f:
    config = yaml.load(f, Loader=yaml.FullLoader)

    INPUT_FILE = config["input_file"]
    SHEET_NAME = config["paragraph_sheet"]
    TEXT_COLUMN = config["text_column"]
    ID_COLUMN = config["id_column"]
    OUTPUT_PATH_ITEMS = config["output_dir"] + "/items.json"
    OUTPUT_PATH_SESSIONS = config["output_dir"] + "/sessions.json"
    INCLUDE_SENTENCES = config["include_sentences"]
    CLOZES_PER_TEXT = config["clozes_per_text"]
    ALTERNATIVE_SUGGESTIONS_PER_CLOZE = config["alternative_suggestions_per_cloze"]
    PARAGRAPH_SESSION_LENGTH = config["paragraph_session_length"]
    SENTENCE_SESSION_LENGTH = config["sentence_session_length"]
    SIMPLE_LANGUAGE_SHEET_NAME = config["simple_language_sheet"]

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

WORKBOOK = load_workbook(INPUT_FILE, data_only=True)
PARAGRAPH_SHEET = WORKBOOK[SHEET_NAME]
SIMPLE_LANGUAGE_SHEET = WORKBOOK[SIMPLE_LANGUAGE_SHEET_NAME]


def get_parsed_texts(sheet):
    text_column = sheet[TEXT_COLUMN]
    id_column = sheet[ID_COLUMN]
    return [{"paragraph": NLP(cell.value), "id": str(id.value)} for id, cell in zip(id_column[1:], text_column[1:])] # column[0] is the column header

def tag_parts_of_speech(text):
    return [{
        "word": word.orth_,
        "type": word.pos_
    } for word in text]

def separate_sentences(text):
    return [sentence.text for sentence in text.sents]

def remove_punctuation(parts_of_speech):
    return [token for token in parts_of_speech if token['type'] != 'PUNCT']

def isNoun(token):
    return token['type'] == 'NOUN' and len(token['word']) > 2

def get_clozes(parts_of_speech, alternative_pool=None):
    if alternative_pool is None:
        alternative_pool = parts_of_speech

    noun_indices = [i for i, token in enumerate(parts_of_speech) if isNoun(token)]
    cloze_indices = random.sample(noun_indices, min(len(noun_indices), CLOZES_PER_TEXT))

    clozes = []

    for i in cloze_indices:
        original = parts_of_speech[i]['word']
        alternatives = set([token['word'] for token in alternative_pool if isNoun(token) and token['word'] != original])
        suggestion_amount = min(len(alternatives), ALTERNATIVE_SUGGESTIONS_PER_CLOZE)
        suggestions = random.sample(alternatives, suggestion_amount)
        clozes.append({
            'wordIndex': i,
            'original': original,
            'alternativeSuggestions': suggestions
        })

    return clozes

def get_sessions(item_ids, session_length):
    random.shuffle(item_ids)
    chunk_amount = math.ceil(len(item_ids) / session_length)
    chunks = numpy.array_split(numpy.array(item_ids), chunk_amount)
    return [chunk.tolist() for chunk in chunks]

def main():
    texts = get_parsed_texts(PARAGRAPH_SHEET)
    simple_texts = get_parsed_texts(SIMPLE_LANGUAGE_SHEET)

    item_documents = []
    paragraph_ids = []
    sentence_ids = []
    simple_sentence_ids = []

    all_texts = texts + simple_texts
    first_simple_text = int(simple_texts[0]['id'])

    for text in all_texts:
        paragraph = text['paragraph']
        sentences = separate_sentences(paragraph)
        parts_of_speech = tag_parts_of_speech(paragraph)

        # there might be empty lines at the end of the doc
        if text['id'] == '':
            continue
        paragraph_id = int(text['id'])

        if paragraph_id < first_simple_text:
            paragraph_document = {
                "_id": str(paragraph_id),
                "type": "paragraph",
                "text": paragraph.text,
                "sentences": sentences,
                "clozes": get_clozes(remove_punctuation(parts_of_speech))
            }

            item_documents.append(paragraph_document)
            paragraph_ids.append(paragraph_id)

        if INCLUDE_SENTENCES != "none":
            # add an itemDoc for each sentence
            for sentence_index, sentence in enumerate(sentences):
                sentence_parts_of_speech = tag_parts_of_speech(NLP(sentence))
                sentence_id = "sent_{}-{}".format(text['id'], sentence_index + 1)

                sentence_document = {
                    "_id": sentence_id,
                    "type": "sentence",
                    "text": sentence,
                    "enclosingParagraph": paragraph.text,
                    "clozes": get_clozes(remove_punctuation(sentence_parts_of_speech), alternative_pool=parts_of_speech)
                }
                item_documents.append(sentence_document)
                if paragraph_id < first_simple_text:
                    sentence_ids.append(sentence_id)
                else:
                    simple_sentence_ids.append(sentence_id)

    paragraph_sessions = get_sessions(paragraph_ids, PARAGRAPH_SESSION_LENGTH)

    if INCLUDE_SENTENCES == 'all':
        sentence_sessions = get_sessions(sentence_ids, SENTENCE_SESSION_LENGTH - 1 )
        # Add one sentence from the Simple Language to each session
        sessions = paragraph_sessions + [session + [random.choice(simple_sentence_ids)] for session in sentence_sessions]
    elif INCLUDE_SENTENCES == 'none':
        sessions = paragraph_sessions
    else:
        selected_sentences = random.sample(sentence_ids, INCLUDE_SENTENCES)
        sentence_sessions = get_sessions(selected_sentences, SENTENCE_SESSION_LENGTH - 1)
        selected_simple_sentences = random.sample(simple_sentence_ids, len(sentence_sessions))

        # Add one sentence from the Simple Language to each session
        sessions = paragraph_sessions + [session + [simple_sentence] for session, simple_sentence in zip(sentence_sessions, selected_simple_sentences)]

        # delete all unused sentences from the item list (this is not the most efficient way to do this - TODO: refactor)
        item_documents = [doc for doc in item_documents if (doc['type'] == 'paragraph' or doc['_id'] in selected_sentences or doc['_id'] in selected_simple_sentences)]


    session_documents = [{
        "_id": str(i+1),
        "items": session
    } for i, session in enumerate(sessions)]

    with open(OUTPUT_PATH_ITEMS, 'w', encoding='utf-8') as file:
        json.dump({'docs': item_documents}, file, ensure_ascii=False, indent=2)

    with open(OUTPUT_PATH_SESSIONS, 'w', encoding='utf-8') as file:
        json.dump({'docs': session_documents}, file, ensure_ascii=False, indent=2)

    print('Your texts have been processed and are ready to be uploaded to your database. Upload the "processed-texts" directory to your sever and run `production/bin/upload-texts.sh` on your server to insert them into your CouchDB.')

main()
