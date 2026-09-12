async function testChatEndpoint() {
  console.log('Testing Chat API genuine question validation...');

  const testQueries = [
    { query: 'How do I calculate XP for level up?', expectedValid: true },
    { query: 'How do I unlock warrior or archmage class?', expectedValid: true },
    { query: 'What happens if I skip a daily quest?', expectedValid: true },
    { query: 'Tell me about focus sessions and ambient rain', expectedValid: true },
    { query: 'What is the capital of Australia?', expectedValid: false },
    { query: 'who is president of mars', expectedValid: false },
    { query: 'asdkjhfakjsd', expectedValid: false },
    { query: 'how to cook biryani', expectedValid: false },
  ];

  // We can simulate the chat handler directly from routes/chat.js logic
  const KNOWLEDGE_BASE = (await import('./backend/routes/chat.js')).default;
  
  console.log('Chat router imported successfully.');
}

testChatEndpoint();
