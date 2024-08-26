import React, { useState, useRef, useEffect } from 'react';
import { Container, Textarea, Select, Group, Title, Paper, Text, SegmentedControl, Button, Slider, Space, Card } from '@mantine/core';

// Available voices for text-to-speech
const voices = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' }
];

function TextToSpeech() {

  // State to manage the text input
  const [text, setText] = useState('');
  // State to manage the selected voice
  const [selectedVoice, setSelectedVoice] = useState(voices[0].value);
  // State to manage speech synthesis
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  // State to manage whether the text box is collapsed
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State to manage speech rate
  const [speechRate, setSpeechRate] = useState(1);

  // Ref to hold the current SpeechSynthesisUtterance instance
  const utteranceRef = useRef(null);
  // Ref to hold the container for text lines
  const linesRef = useRef(null);
  // Ref to hold the text area element
  const textAreaRef = useRef(null);

  // Function to handle text-to-speech functionality
  const handleSpeak = () => {
    if (!text) return; // Do nothing if the text is empty

    const lines = text.split(/\r?\n/);

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = selectedVoice; // Set the selected voice
    utterance.rate = speechRate; // Set the speech rate

    let startLineIndex = currentLine + 1;

    const speakLine = () => {
      if (startLineIndex >= lines.length) {
        setIsPlaying(false);
        setCurrentLine(-1);
        return;
      }

      const line = lines[startLineIndex];
      utterance.text = line;
      window.speechSynthesis.speak(utterance);
      setCurrentLine(startLineIndex);
      startLineIndex += 1;
    };

    // Handle end of speech event
    utterance.onend = () => {
      speakLine();
    };

    // Handle pause event
    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
    };

    // Handle resume event
    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
    };

    // Set up the utterance
    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    setIsCollapsed(true); // Collapse the text box when speaking starts
    speakLine();
  };

  // Function to pause the speech
  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  // Function to resume the speech
  const handleResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  // Function to stop the speech
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentLine(-1);
    setIsCollapsed(false); // Open the text box when stopping
  };

  // Function to handle line click
  const handleLineClick = (index) => {
    if (window.speechSynthesis.speaking || isPlaying) {
      handleStop();
    }

    const lines = text.split(/\r?\n/);
    const utterance = new SpeechSynthesisUtterance();

    utterance.lang = selectedVoice;
    utterance.rate = speechRate;

    let startLineIndex = index;

    const speakLine = () => {
      if (startLineIndex >= lines.length) {
        setIsPlaying(false);
        setCurrentLine(-1);
        return;
      }

      const line = lines[startLineIndex];
      utterance.text = line;
      window.speechSynthesis.speak(utterance);
      setCurrentLine(startLineIndex);
      startLineIndex += 1;
    };

    // Handle end of speech event
    utterance.onend = () => {
      speakLine();
    };

    // Handle pause event
    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
    };

    // Handle resume event
    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
    };

    // Set up the utterance
    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    setIsCollapsed(true); // Collapse the text box when a line is spoken
    speakLine();
  };

  // Scroll to the highlighted line
  useEffect(() => {
    if (currentLine !== -1 && linesRef.current) {
      const element = linesRef.current.children[currentLine];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentLine]);

  // Function to handle text area expansion
  const handleEdit = () => {
    if (isPlaying) {
      handleStop();
    }
    setIsCollapsed(false);
    textAreaRef.current?.focus();
  };

  const lines = text.split(/\r?\n/);

  return (
    <>
      <Card padding="md" shadow="xs" mt="md" radius="md" withBorder>
        {/* Select component for choosing the voice */}
        <Select
          data={voices}
          value={selectedVoice}
          onChange={(value) => setSelectedVoice(value)}
          label="Select Voice"
          placeholder="Select a voice"
          mb="md" // Margin-bottom for spacing
        />
        <Group direction="row" spacing="md" mb="md">
          {/* Slider for adjusting the speech rate */}
          <div style={{ flex: 1 }}>
            <Text size="sm">Speech Rate</Text>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={speechRate}
              onChange={setSpeechRate}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 0.5, label: '0.5' },
                { value: 1, label: '1' },
                { value: 1.5, label: '1.5' },
                { value: 2, label: '2' },
              ]}
            />
          </div>
        </Group>
        <Space h='20px'/>
        <Group direction="row" spacing="md">
          {/* Textarea for user input */}
          {!isCollapsed ? (
            <Textarea
              ref={textAreaRef}
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
              placeholder="Enter text here"
              minRows={10} // Increased height
              maxRows={20} // Maximum height with scroll
              autosize // Automatically adjusts height
              style={{ width: '100%' }} // Full width
            />
          ) : (
            <Button onClick={handleEdit} color="green">
              Edit
            </Button>
          )}
          {/* Highlight current line */}
          <div
            ref={linesRef}
            style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '400px' }}
          >
            {lines.map((line, index) => (
              <p
                key={index}
                onClick={() => handleLineClick(index)}
                style={{
                  backgroundColor: index === currentLine ? '#171616' : 'transparent',
                  padding: '5px',
                  margin: '0',
                  cursor: 'pointer', // Indicate clickable line
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </Group>
      </Card>
      {/* Fixed position buttons */}
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '25%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        zIndex: 1000, // Ensure buttons are above other content
      }}>
        <Button onClick={handleSpeak} color="blue" disabled={isPlaying}>
          Speak
        </Button>
        <Button onClick={handlePause} color="yellow" disabled={!isPlaying || isPaused}>
          Pause
        </Button>
        <Button onClick={handleResume} color="green" disabled={!isPaused}>
          Resume
        </Button>
        <Button onClick={handleStop} color="red" disabled={!isPlaying && !isPaused}>
          Stop
        </Button>
      </div>
    </>
  );

}

export default TextToSpeech; 