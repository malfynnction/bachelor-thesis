import spacy
from openpyxl import load_workbook

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

dataPath = 'data.xlsx' # TODO: make this easier editable
sheetName = 'paragraphs' # TODO: make this easier editable

workbook = load_workbook(dataPath)
sheet = workbook[sheetName]

paragraphColumn = 'B'

def getParsedTexts():
  column = sheet[paragraphColumn]
  texts = []
  for cell in column:
    texts.append(npl(cell.value))
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
