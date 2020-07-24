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
    SHEET_NAME = config["sheet"]
    TEXT_COLUMN = config["text_column"]
    ID_COLUMN = config["id_column"]
    OUTPUT_PATH_ITEMS = config["output_dir"] + "/items.json"
    OUTPUT_PATH_SESSIONS = config["output_dir"] + "/sessions.json"
    INCLUDE_ALL_SENTENCES = config["include_all_sentences"]
    CLOZES_PER_TEXT = config["clozes_per_text"]
    ALTERNATIVE_SUGGESTIONS_PER_CLOZE = config["alternative_suggestions_per_cloze"]
    PARAGRAPH_SESSION_LENGTH = config["paragraph_session_length"]
    SENTENCE_SESSION_LENGTH = config["sentence_session_length"]
    SIMPLE_LANGUAGE_STARTING_ID = config["simple_language_starting_id"]

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

WORKBOOK = load_workbook(INPUT_FILE)
SHEET = WORKBOOK[SHEET_NAME]


def get_parsed_texts():
    text_column = SHEET[TEXT_COLUMN]
    id_column = SHEET[ID_COLUMN]
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

def get_clozes(parts_of_speech, alternative_pool=None):
    if alternative_pool is None:
        alternative_pool = parts_of_speech

    noun_indices = [i for i, token in enumerate(parts_of_speech) if token['type'] == 'NOUN']
    cloze_indices = random.sample(noun_indices, min(len(noun_indices), CLOZES_PER_TEXT))

    clozes = []

    for i in cloze_indices:
        original = parts_of_speech[i]['word']
        alternatives = set([token['word'] for token in alternative_pool if token['type'] == 'NOUN' and token['word'] != original])
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
    texts = get_parsed_texts()
    item_documents = []
    paragraph_ids = []
    sentence_ids = []
    simple_sentence_ids = []

    for index, text in enumerate(texts):
        paragraph = text['paragraph']
        sentences = separate_sentences(paragraph)
        parts_of_speech = tag_parts_of_speech(paragraph)
        paragraph_id = text['id']

        paragraph_document = {
            "_id": paragraph_id,
            "type": "paragraph",
            "text": paragraph.text,
            "sentences": sentences,
            "clozes": get_clozes(remove_punctuation(parts_of_speech))
        }

        item_documents.append(paragraph_document)
        paragraph_ids.append(paragraph_id)

        if INCLUDE_ALL_SENTENCES:
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
                if (text['id'] < SIMPLE_LANGUAGE_STARTING_ID):
                    sentence_ids.append(sentence_id)
                else:
                    simple_sentence_ids.append(sentence_id)

    paragraph_sessions = get_sessions(paragraph_ids, PARAGRAPH_SESSION_LENGTH)

    if INCLUDE_ALL_SENTENCES:
        sentence_sessions = get_sessions(sentence_ids, SENTENCE_SESSION_LENGTH - 1 )
        # Add one sentence from the Simple Language to each session
        sessions = paragraph_sessions + [session + [random.choice(simple_sentence_ids)] for session in sentence_sessions]
    else:
        sessions = paragraph_sessions

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
