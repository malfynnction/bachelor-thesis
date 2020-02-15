import spacy

nlp = spacy.load('de')

doc = nlp(u'Dies ist ein Satz. Das ist ein zweiter Satz, der das Ganze hier zu einem Paragraph macht.')


def partOfSpeechTagger():
  words = []
  for t in doc:
    words.append({'word': t.orth_, 'type': t.pos_})
  print(words)

partOfSpeechTagger()