import unicodedata

def scan_files(word_file, data_file, output_file):
    # Read words from the first file
    with open(word_file, 'r', encoding='UTF-8') as wf:
        words = [line.strip() for line in wf]

    # Open the data file and the output file
    arr = {}
    with open(data_file, 'r', encoding='UTF-8') as df:
        for line in df:
            parts = line.split(' ')
            if len(parts) < 5:
                continue

            # Extract the Greek words and the left side of the data
            left_side = ' '.join(parts[1:-4])
            greek_words = parts[-4:]

            # Check if any Greek word matches a word from the first file
            
            for word in greek_words:
                arr[unicodedata.normalize('NFD', word.lower())] = left_side
    with open(output_file, 'w', encoding='UTF-8') as of:
        for word in words:
            normalword = unicodedata.normalize('NFD', word).lower()
            if normalword in arr:
                of.write(f"{normalword} {arr[normalword]}\n")
            else:
                print("not found " + word + " " + normalword)

# Usage
word_file = 'unique_words.txt'
data_file = '70-Eph-morphgnt.txt'
output_file = 'output.txt'
scan_files(word_file, data_file, output_file)
