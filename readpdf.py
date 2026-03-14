import pypdf
import sys

def main():
    with open('Manual-Banco-Imobiliario-Junior.pdf', 'rb') as f:
        reader = pypdf.PdfReader(f)
        with open('manual.txt', 'w', encoding='utf-8') as out:
            for page in reader.pages:
                out.write(page.extract_text() + '\n')

if __name__ == '__main__':
    main()
