import React, { useState } from 'react';
import { Card, Button, Textarea, FileInput, Group, Alert } from '@mantine/core';
import * as pdfjsLib from 'pdfjs-dist';

// Use the correct worker script URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `pdf.worker.min.mjs`;

function PdfExtractor() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState('');

  const handleFileChange = (file) => {
    if (file) {
      setFile(file);
    }
  };

  const extractTextFromPDF = async (pdfFile) => {
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);
      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const numPages = pdf.numPages;
        let extractedText = '';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = processTextContent(textContent);
          extractedText += pageText + '\n';  // Adding a new line between pages
        }

        setText(extractedText);
        setAlert(''); // Clear any previous alerts
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        setAlert('Error extracting text from PDF.');
      }
    };

    fileReader.readAsArrayBuffer(pdfFile);
  };

  const processTextContent = (textContent) => {
    let pageText = '';
    const items = textContent.items;

    // Sort items by their vertical position to maintain order
    items.sort((a, b) => a.transform[5] - b.transform[5]);

    let lastY = null;
    for (const item of items) {
      // Filter out empty or irrelevant strings
      if (item.str.trim().length > 0) {
        const currentY = item.transform[5];
        if (lastY !== null && Math.abs(currentY - lastY) > 20) {
          // Add a new line for significant vertical gaps
          pageText += '\n';
        }
        // Add indentation for items with small horizontal position (e.g., start of a new paragraph)
        const indent = item.transform[4] > 50 ? '  ' : '';
        pageText += `${indent}${item.str}`;
        lastY = currentY;
      }
    }

    return pageText;
  };

  const handleUpload = () => {
    if (file) {
      extractTextFromPDF(file);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setAlert('Text copied to clipboard.');
      })
      .catch(() => {
        setAlert('Failed to copy text to clipboard.');
      });
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-text.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card padding="md" shadow="xs" mt="md" radius="md" withBorder>
      <FileInput
        accept=".pdf"
        onChange={(file) => handleFileChange(file)}
        placeholder="Upload PDF file"
        mt="md"
      />
      <Button onClick={handleUpload} mt="md">Extract Text </Button>
      {alert && <Alert title="Notice" color="blue" mt="md">{alert}</Alert>}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        mt="md"
        minRows={10}
        placeholder="Extracted text will appear here"
      />
      <Group mt='md'>
        <Button variant='light' onClick={handleCopyToClipboard} disabled={!text}>
          Copy to Clipboard
        </Button>
        <Button variant='light' color='red' onClick={handleDownload} disabled={!text}>
          Download as File
        </Button>
      </Group>
    </Card>
  );
}

export default PdfExtractor;
