import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { CommandOutput } from '../types';
import AITrainerService from '../services/AITrainerService';

interface TerminalProps {
  onCommandExecuted?: (output: CommandOutput) => void;
}

const HELP_TEXT = `Available Commands:
  help                          - Show this help message
  init <api_key>                - Initialize AI trainer with API key
  train <file> <model> [epochs] - Start training job
  status <job_id>               - Get training job status
  list                          - List all training jobs
  cancel <job_id>               - Cancel a training job
  test <model> <prompt>         - Test a model with a prompt
  validate <file>               - Validate training data file
  clear                         - Clear terminal output

Examples:
  init sk-...
  train /path/to/data.jsonl gpt-3.5-turbo 3
  status job_abc123
  test ft:gpt-3.5-turbo:... "Hello!"
`;

const Terminal: React.FC<TerminalProps> = ({ onCommandExecuted }) => {
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      command: 'welcome',
      output: 'AI Training Terminal\nType "help" for available commands.',
      timestamp: Date.now(),
      success: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output = '';
    let success = true;

    try {
      switch (command) {
        case 'help':
          output = HELP_TEXT;
          break;

        case 'init':
          if (args.length === 0) {
            output = 'Error: API key required\nUsage: init <api_key>';
            success = false;
          } else {
            await AITrainerService.initialize(args[0]);
            output = 'AI Trainer initialized successfully!';
          }
          break;

        case 'train':
          if (args.length < 2) {
            output = 'Error: Missing arguments\nUsage: train <file> <model> [epochs]';
            success = false;
          } else {
            const [file, model, epochs = '3'] = args;
            const job = await AITrainerService.startTraining(
              file,
              model,
              parseInt(epochs)
            );
            output = `Training job started!\nJob ID: ${job.id}\nModel: ${job.model}\nStatus: ${job.status}`;
          }
          break;

        case 'status':
          if (args.length === 0) {
            output = 'Error: Job ID required\nUsage: status <job_id>';
            success = false;
          } else {
            const job = await AITrainerService.getJobStatus(args[0]);
            output = `Job ID: ${job.id}\nModel: ${job.model}\nStatus: ${job.status}\nCreated: ${job.created_at}`;
            if (job.fine_tuned_model) {
              output += `\nFine-tuned Model: ${job.fine_tuned_model}`;
            }
            if (job.error) {
              output += `\nError: ${job.error}`;
            }
          }
          break;

        case 'list':
          const jobs = await AITrainerService.listJobs();
          if (jobs.length === 0) {
            output = 'No training jobs found.';
          } else {
            output = 'Training Jobs:\n' + jobs.map((job, i) =>
              `${i + 1}. ${job.id.substring(0, 12)}... - ${job.model} - ${job.status}`
            ).join('\n');
          }
          break;

        case 'cancel':
          if (args.length === 0) {
            output = 'Error: Job ID required\nUsage: cancel <job_id>';
            success = false;
          } else {
            const job = await AITrainerService.cancelJob(args[0]);
            output = `Job ${job.id} cancelled.\nStatus: ${job.status}`;
          }
          break;

        case 'test':
          if (args.length < 2) {
            output = 'Error: Missing arguments\nUsage: test <model> <prompt>';
            success = false;
          } else {
            const model = args[0];
            const prompt = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
            const response = await AITrainerService.testModel(model, prompt);
            output = `Model: ${model}\nPrompt: ${prompt}\n\nResponse:\n${response}`;
          }
          break;

        case 'validate':
          if (args.length === 0) {
            output = 'Error: File path required\nUsage: validate <file>';
            success = false;
          } else {
            const isValid = await AITrainerService.validateData(args[0]);
            output = isValid
              ? `✓ Training data is valid!`
              : `✗ Training data is invalid.`;
            success = isValid;
          }
          break;

        case 'clear':
          setHistory([]);
          return;

        default:
          output = `Unknown command: ${command}\nType "help" for available commands.`;
          success = false;
      }
    } catch (error) {
      output = `Error: ${error instanceof Error ? error.message : String(error)}`;
      success = false;
    }

    const commandOutput: CommandOutput = {
      command: cmd,
      output,
      timestamp: Date.now(),
      success,
    };

    setHistory(prev => [...prev, commandOutput]);
    if (onCommandExecuted) {
      onCommandExecuted(commandOutput);
    }

    // Add to command history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
  };

  const handleSubmit = () => {
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return;

    let newIndex = historyIndex;
    if (direction === 'up') {
      newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
    } else {
      newIndex = historyIndex > -1 ? historyIndex - 1 : -1;
    }

    setHistoryIndex(newIndex);
    if (newIndex === -1) {
      setInput('');
    } else {
      setInput(commandHistory[commandHistory.length - 1 - newIndex]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.output}
        contentContainerStyle={styles.outputContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {history.map((item, index) => (
          <View key={index} style={styles.commandBlock}>
            {item.command !== 'welcome' && (
              <Text style={styles.commandText}>$ {item.command}</Text>
            )}
            <Text style={[styles.outputText, !item.success && styles.errorText]}>
              {item.output}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.prompt}>$</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
          placeholder="Enter command..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyControls}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigateHistory('up')}
        >
          <Text style={styles.historyButtonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigateHistory('down')}
        >
          <Text style={styles.historyButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  output: {
    flex: 1,
  },
  outputContent: {
    padding: 12,
  },
  commandBlock: {
    marginBottom: 16,
  },
  commandText: {
    color: '#4ec9b0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 4,
  },
  outputText: {
    color: '#d4d4d4',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  errorText: {
    color: '#f48771',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#3c3c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  prompt: {
    color: '#4ec9b0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#d4d4d4',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#007acc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyControls: {
    flexDirection: 'row',
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#3c3c3c',
    padding: 4,
  },
  historyButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#d4d4d4',
    fontSize: 16,
  },
});

export default Terminal;
