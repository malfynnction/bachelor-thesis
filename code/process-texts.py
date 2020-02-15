import spacy

nlp = spacy.load('de')

text = "Dies ist ein Satz. Das ist ein zweiter Satz, der das Ganze hier zu einem Paragraph macht.Ich füge einen 3. Satz ein, der im 19. Jh. am 27. Aug. geschrieben wurde."
doc = nlp(text)


def tagPartsOfSpeech():
  words = []
  for t in doc:
    words.append({'word': t.orth_, 'type': t.pos_})
  return words

def separateSentences():
  sentences = []
  for sentence in doc.sents:
    sentences.append(sentence)
  return sentences

separateSentences()