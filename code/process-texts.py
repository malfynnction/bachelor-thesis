import spacy
from openpyxl import load_workbook
import random

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
INCLUDE_ALL_SENTENCES = True
CLOZES_PER_TEXT = 5

workbook = load_workbook(DATA_PATH)
sheet = workbook[SHEET_NAME]

paragraphColumn = 'B'

def getParsedTexts():
  column = sheet[paragraphColumn]
  texts = []
  for cell in column:
    texts.append(nlp(cell.value))
  return texts[1:] # texts[0] is the column header

def tagPartsOfSpeech(text):
  words = []
  for t in text:
    words.append({'word': t.orth_, 'type': t.pos_})
  return words

def separateSentences(text):
  sentences = []
  for sentence in text.sents:
    sentences.append(sentence)
  return sentences

def getClozeIndices(partsOfSpeech):
  nounIndices = [i for i,token in enumerate(partsOfSpeech) if token['type'] == 'NOUN']
  clozeIndices = random.sample(nounIndices, CLOZES_PER_TEXT)
  return clozeIndices

def main():
  texts = getParsedTexts()
  itemDocuments = []
  # TODO: sessionDocuments (or is that static?)

  for index, text in enumerate(texts):
    sentences = separateSentences(text)
    partsOfSpeech = tagPartsOfSpeech(text)

    document = {
      "_id": 'par_{}'.format(index),
      "text": text,
      "sentences": sentences,
      "partsOfSpeech": partsOfSpeech,
      "clozeIndices": getClozeIndices(partsOfSpeech)
      # TODO:
      # "enclosingParagraph" (only for sentences)
    }

    # TODO: add an itemDoc for all sentences in $text if INCLUDE_ALL_SENTENCES

    itemDocuments.append(document)

main()