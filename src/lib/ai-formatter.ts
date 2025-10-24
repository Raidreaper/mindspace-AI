/**
 * Utility functions for formatting AI responses
 */

/**
 * Formats AI response text by converting markdown-style formatting to proper HTML
 * and cleaning up formatting issues
 */
export function formatAIResponse(text: string): string {
  if (!text) return text;

  // Remove markdown asterisks and convert to proper formatting
  let formatted = text
    // Convert **bold** to <strong>bold</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>italic</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert bullet points with asterisks to proper list items
    .replace(/^\s*\*\s+/gm, '• ')
    // Clean up multiple asterisks
    .replace(/\*{2,}/g, '')
    // Convert line breaks to proper spacing
    .replace(/\n\n/g, '\n')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();

  return formatted;
}

/**
 * Creates a better prompt for AI responses that encourages natural, conversational responses
 */
export function createConversationalPrompt(context: string, history: string, userMessage: string): string {
  return `You are a warm, supportive wellness assistant. Respond naturally and conversationally without using markdown formatting, asterisks, or bullet points. 

Context: ${context}

Previous conversation:
${history}

User: ${userMessage}

Assistant:`;
}

/**
 * Creates a prompt for task suggestions that returns clean, actionable items
 */
export function createTaskSuggestionPrompt(tasks: string[]): string {
  return `You are a wellness coach. Based on this task history, propose 3-5 short, actionable wellness tasks (5-7 words each). 

Return ONLY the task titles as plain text, one per line, without:
- Bullet points or asterisks
- Numbering
- Extra formatting
- Explanations

Tasks so far:
${tasks.join('\n')}

Suggested tasks:`;
}
