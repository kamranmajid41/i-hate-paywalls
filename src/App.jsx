import React, { useState } from 'react';
import { MantineProvider, Container, Textarea, Select, Group, Title, Paper, Text, SegmentedControl, Button, Slider, Space, Card } from '@mantine/core';
import TextToSpeech from './Tabs/TextToSpeech';
import GooGoo from './Tabs/GooGoo';
import PdfExtractor from './Tabs/PdfExtractor';

// Available voices for text-to-speech
const voices = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  // You can add more voices here
];

function App() {
  // State to manage the selected tool (currently only text-to-speech is available)
  const [tool, setTool] = useState('text-to-speech');

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Container>
        <Space h="20px"/>
        <Title order={1} align="center" mb="lg">
          i-hate-paywalls
        </Title>
        <Text align="center">
          A bare bones web-app with stuff that I commonly use.
        </Text>
        <Space h="20px"/>
        {/* Tool selection */}
        <SegmentedControl
          value={tool}
          onChange={setTool}
          data={[
            { label: 'Text-to-Speech', value: 'text-to-speech' },
            { label: 'PDF-Text-Extractor', value: 'pdf-extractor' },
            { label: 'Goo-Goo-Ga-Ga', value: 'goo-goo' }
          ]}
        />
        {
          tool === 'goo-goo' && 
          <GooGoo/>
        }
        {
          tool === 'pdf-extractor' &&
          <PdfExtractor/>
        }
        {
          tool === 'text-to-speech' &&
          <TextToSpeech/>
        }
       
      </Container>
    </MantineProvider>
  );
}

export default App;
