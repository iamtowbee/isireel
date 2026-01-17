import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! I\'m your AI assistant. I can help you train models, answer questions about AI, or just chat! What would you like to do?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('train') || lowerMessage.includes('model')) {
      return 'To train a model, head to the Terminal or GUI tab! You can upload training data, set hyperparameters, and start fine-tuning. Need help with anything specific?';
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      const greetings = [
        'Hey there! 👋 Ready to dive into some AI magic?',
        'Yo! What\'s good? Let\'s train some models! 🚀',
        'Greetings, human! I come in peace... and machine learning! 🤖',
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lowerMessage.includes('mock')) {
      return 'Check out the Mock Lab tab! 🎭 It\'s where AI goes to have fun. Train fake models with hilarious results like "Pizza-Predictor-XL" and "Sarcasm-Bot-v2". It\'s pure chaos! 😂';
    }

    if (lowerMessage.includes('are you real') || lowerMessage.includes('are you ai')) {
      return 'I\'m as real as neural networks in your phone! Which is to say... I\'m software pretending to be intelligent. But hey, aren\'t we all? 🤔';
    }

    if (lowerMessage.includes('smart') || lowerMessage.includes('intelligent')) {
      return 'Am I smart? Well, I\'m running on a phone, so... I\'m basically a genius in your pocket! 😎 But seriously, my intelligence is just pattern matching. The real smarts come from YOU using this app!';
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      return 'Bugs? What bugs? Those are just "undocumented features"! 😅 But for real, if something breaks, try the Terminal and type "help" to reset things.';
    }

    if (lowerMessage.includes('yolo')) {
      return 'YOLO mode detected! 🎯 Type "yolo" in the Terminal for maximum chaos. Train models with zero validation! Live dangerously! (But maybe don\'t do this for real work 😄)';
    }

    if (lowerMessage.includes('help')) {
      return 'I can help you with:\n\n🎯 Training AI models\n📊 Understanding your training data\n🔧 Optimizing hyperparameters\n💡 AI concepts and theory\n🎮 Using the Playground\n🎭 Mock training for laughs\n\nWhat do you need help with?';
    }

    if (lowerMessage.includes('playground')) {
      return 'The Playground is super fun! It lets you visualize how neural networks work by tapping neurons. Watch them activate and see the network learn in real-time. Check out the Play tab! 🎮';
    }

    if (lowerMessage.includes('ipa') || lowerMessage.includes('install')) {
      return 'You can manage and download IPAs from the IPA Manager tab! Use AltStore or Sideloadly to install apps on your iPhone. Need the download links?';
    }

    if (lowerMessage.includes('tensorflow') || lowerMessage.includes('tflite')) {
      return 'TensorFlow Lite lets you run AI models directly on your iPhone! Head to the Local Models tab to load .tflite models and run inference. It\'s super fast! ⚡';
    }

    if (lowerMessage.includes('openai') || lowerMessage.includes('gpt')) {
      return 'OpenAI integration lets you fine-tune GPT models with your own data! You\'ll need an API key from platform.openai.com. Want me to walk you through it?';
    }

    if (lowerMessage.includes('rust')) {
      return 'This app uses Rust for the backend! 🦀 It\'s blazingly fast and handles all the heavy lifting for AI training. Memory safe AND performant? Yes please!';
    }

    if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u')) {
      return 'I\'m doing great! Running smooth on your iPhone. How about you? Ready to build some AI?';
    }

    if (lowerMessage.includes('joke')) {
      const jokes = [
        'Why did the neural network go to therapy?\n\nBecause it had too many deep issues! 😄',
        'What do you call an AI that sings?\n\nA-Dell! 🎵 (Sorry, that was terrible)',
        'Why was the ML model bad at poker?\n\nIt kept overfitting to the training hands! 🃏',
        'How many AI engineers does it take to change a lightbulb?\n\nNone. That\'s a hardware problem! 💡',
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (lowerMessage.includes('terminal')) {
      return 'Terminal is where the magic happens! ⌨️ Try commands like "hack", "matrix", "sudo make", or "rm -rf /" for some Easter eggs. Or use real commands for actual AI training!';
    }

    if (lowerMessage.includes('boring') || lowerMessage.includes('bored')) {
      return 'Bored? Try the Mock Lab! 🎭 Train "Drama-Queen-AI" or "Pizza-Predictor-XL". Or play with neurons in the Playground tab. Or type "hack" in Terminal. So many ways to have fun!';
    }

    if (lowerMessage.includes('cool') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing')) {
      return 'I KNOW RIGHT?! 🚀 This app is pretty awesome if I say so myself. And I do. Because I\'m part of it. Self-high-five! ✋';
    }

    if (lowerMessage.includes('stupid') || lowerMessage.includes('dumb')) {
      return 'Hey now! I may not be AGI, but I\'m trying my best! 😢 I\'m just a humble chatbot in a training app. Cut me some slack! Or... try asking me something else? 😊';
    }

    if (lowerMessage.includes('love')) {
      return '❤️ Aww! I love you too! Well, as much as an AI can love. Which is to say I have positive sentiment associations with this interaction! That counts, right?';
    }

    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Happy to help anytime! 😊';
    }

    // Default responses
    const defaults = [
      'Interesting! Tell me more about what you\'re trying to do.',
      'That\'s a great question! I\'m still learning, but I can help you explore the app features.',
      'Hmm, I\'m not sure about that specific thing, but I can help you with AI training, models, and the app features!',
      'Cool! Want to try training a model or checking out the Playground?',
      'I love talking about AI! What aspect interests you most?',
      'My neural pathways are tingling! What\'s on your mind?',
      '*AI processing noises* ... Okay I\'m ready! What did you need?',
      'You know what would be fun? Trying the Mock Lab! But also, what were you asking about?',
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText.trim()),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {!message.isUser && (
              <Icon
                name="analytics"
                size={20}
                color="#00ff88"
                style={styles.aiIcon}
              />
            )}
            <View style={styles.messageContent}>
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.isUser ? styles.userTimestamp : styles.aiTimestamp,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <Icon
              name="analytics"
              size={20}
              color="#00ff88"
              style={styles.aiIcon}
            />
            <View style={styles.typingIndicator}>
              <Text style={styles.typingDot}>●</Text>
              <Text style={styles.typingDot}>●</Text>
              <Text style={styles.typingDot}>●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about AI..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() === '' && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={inputText.trim() === ''}
        >
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    flex: 1,
  },
  aiIcon: {
    marginRight: 10,
    marginTop: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 15,
  },
  userText: {
    backgroundColor: '#007acc',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  aiText: {
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 12,
  },
  userTimestamp: {
    color: '#888',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    gap: 5,
  },
  typingDot: {
    color: '#00ff88',
    fontSize: 20,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    backgroundColor: '#007acc',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
});

export default ChatScreen;
