def extract_unique_words(filename):
    unique_words = set()

    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            # Split line into words based on whitespace and remove punctuation
            words = line.strip().split()
            for word in words:
                # Normalize word (optional: remove punctuation, convert to lower case)
                normalized_word = word.strip().lower()
                unique_words.add(normalized_word)

    return sorted(unique_words)

def main():
    input_file = 'ephesians_1.txt'  # Replace with your file name
    unique_words = extract_unique_words(input_file)

    # Write the unique words to an output file, one per line
    with open('unique_words.txt', 'w', encoding='utf-8') as outfile:
        for word in unique_words:
            outfile.write(f"{word}\n")

    print(f"Unique words have been written to 'unique_words.txt'.")

if __name__ == '__main__':
    main()
