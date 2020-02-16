import spacy
from openpyxl import load_workbook
import random
import json

nlp = spacy.load('de')

def customSentenceBoundaries(doc):
  notSentenceBoundary = [":", "°", ";", "±"]
  for token in doc[:-1]:
    if token.text in notSentenceBoundary:
      doc[token.i+1].is_sent_start = False
    if token.text == "°":
      doc[token.i].is_sent_start = False
    if token.text == "…" and doc[token.i-1].text == "[" and doc[token.i+1].text =="]": # ellipses in a quote are not a new sentence
      doc[token.i+1].is_sent_start = False
  return doc

nlp.add_pipe(customSentenceBoundaries, before="parser")

# TODO: make this easier editable
DATA_PATH = 'data.xlsx'
SHEET_NAME = 'paragraphs'
TEXT_COLUMN = 'B'
OUTPUT_PATH_ITEMS = 'items.json'
INCLUDE_ALL_SENTENCES = True
CLOZES_PER_TEXT = 5
ALTERNATIVE_SUGGESTIONS_PER_CLOZE = 4

workbook = load_workbook(DATA_PATH)
sheet = workbook[SHEET_NAME]


def getParsedTexts():
  column = sheet[TEXT_COLUMN]
  return [nlp(cell.value) for cell in column[1:]] # column[0] is the column header

def tagPartsOfSpeech(text):
  return [{
    "word": word.orth_,
    "type": word.pos_
  } for word in text]

def separateSentences(text):
  return [sentence.text for sentence in text.sents]

def getClozes(partsOfSpeech):
  nounIndices = [i for i,token in enumerate(partsOfSpeech) if token['type'] == 'NOUN']
  clozeIndices = random.sample(nounIndices, CLOZES_PER_TEXT)
  clozes = [{
    'wordIndex': i,
    'original': partsOfSpeech[i]['word'],
    'alternativeSuggestions': [partsOfSpeech[altIndex]['word'] for altIndex in random.sample(nounIndices, ALTERNATIVE_SUGGESTIONS_PER_CLOZE)]
  } for i in clozeIndices]
  return clozes

def main():
  texts = getParsedTexts()
  itemDocuments = []
  # TODO: sessionDocuments

  for index, text in enumerate(texts[:1]):
    sentences = separateSentences(text)
    partsOfSpeech = tagPartsOfSpeech(text)

    document = {
      "_id": 'par_{}'.format(index+1),
      "text": text.text,
      "sentences": sentences,
      "partsOfSpeech": partsOfSpeech,
      "clozes": getClozes(partsOfSpeech)
      # TODO:
      # "enclosingParagraph" (only for sentences)
    }

    # TODO: add an itemDoc for every sentence in $text if INCLUDE_ALL_SENTENCES
    itemDocuments.append(document)

  with open(OUTPUT_PATH_ITEMS, 'w', encoding='utf-8') as f:
    json.dump({'docs': itemDocuments}, f, ensure_ascii=False, indent=2)

  print('Your items have been processed and are ready to be uploaded to your database. Run \n \
    curl -X POST YOUR-COUCH-URL-HERE/items/_bulk_docs -H \'Content-Type: application/json\' -d @{}\n \
    to automatically upload them.'.format(OUTPUT_PATH_ITEMS))
  # TODO: this does not work if /items does not exist!

main()