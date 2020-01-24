from openpyxl import load_workbook
import duden

file_path = '../data.xlsx'

workbook = load_workbook(filename=file_path)
sheet = workbook['paragraphs']
paragraph_column = 'B'
syllable_column = 'K'

def get_syllable_count (word):
  print(word)
  duden_entry = duden.get(word)
  print(duden_entry and duden_entry.word_separation)
  return 1 # TODO


for row in range(sheet.min_row + 1, sheet.min_row + 2): # TODO: go up to max_row + 1
  text = sheet['{}{}'.format(paragraph_column, row)].value
  words = text.split()
  syllables = 0
  for word in words:
    syllables += get_syllable_count(word)
  sheet['{}{}'.format(syllable_column, row)] = syllables

# workbook.save(filename=file_path)