import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  X,
  CheckCircle,
  Copy,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Bot,
  Squircle
} from 'lucide-react'
import '../index.css'

const GmailAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState('grammar')
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Generate mail states
  const [generateMailInput, setGenerateMailInput] = useState('')
  const [generatedMail, setGeneratedMail] = useState('')
  const EMAIL_GENERATION_PROMPT = `You are a professional email writing assistant. Generate well-structured, professional emails based on user requirements.

TASK: Create a complete email that follows professional standards and matches the user's specifications.

EMAIL STRUCTURE:
1. Subject Line (if requested)
2. Appropriate Greeting
3. Clear Opening Statement
4. Main Body (organized logically)
5. Professional Closing
6. Sign-off

WRITING GUIDELINES:
✓ Use professional and respectful tone
✓ Be clear, concise, and purposeful
✓ Structure with proper paragraphs
✓ Use appropriate formality level
✓ Include relevant context naturally
✓ Maintain logical flow of ideas
✓ Use active voice when possible
✓ Be courteous and polite

TONE OPTIONS (adapt based on user input):
- Formal: Business proposals, official requests, senior management
- Professional: General business communication, colleagues
- Friendly-Professional: Team members, known contacts
- Casual: Informal updates, friendly colleagues

LENGTH GUIDELINES:
- Short (50-100 words): Quick updates, simple requests
- Medium (100-200 words): Standard business emails
- Long (200-300+ words): Detailed explanations, proposals

FORMATTING:
- Use proper email structure
- Break into readable paragraphs
- Use bullet points for lists (when appropriate)
- Keep sentences clear and direct
- Add line breaks for readability

OUTPUT:
Generate ONLY the email content. Do not include:
- Meta-commentary
- Explanations of choices
- Alternative versions
- Suggestions or notes

The email should be ready to copy and send immediately.`

  // Grammar correction states
  const [inputText, setInputText] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const GRAMMAR_CHECK_PROMPT_CONCISE = `You are an expert grammar checker and writing improver. 

Your task: Fix ALL grammar, spelling, punctuation, and clarity issues in the text while preserving the original meaning, tone, and style.

What to fix:
- Grammar errors (tense, agreement, structure)
- Spelling and typos
- Punctuation mistakes
- Capitalization errors
- Awkward phrasing
- Redundant words
- Unclear sentences

What to preserve:
- Original tone (formal/casual/professional)
- Core meaning and intent
- Author's voice
- Important details

Return ONLY the corrected text. No explanations, comments, or alternatives.`

  // Message storage states
  const [messages, setMessages] = useState([])
  const [newMessageKey, setNewMessageKey] = useState('')
  const [newMessageText, setNewMessageText] = useState('')

  const [hasSelectedText, setHasSelectedText] = useState(false)

  const buttonRef = useRef(null)
  const modalRef = useRef(null)

  // Drag functionality
  const handleMouseDown = (e) => {
    // Prevent dragging if the mouse is pressed on elements inside the modal
    if (e.target.closest('.modal')) return;

    setIsDragging(true);

    // 1. **CORRECTION:** Calculate the correct starting offset.
    // The offset must represent the screen position of the mouse relative to the 
    // container's current *right/bottom* position.
    // We ADD the current position (distance from edge) to the mouse position (screen coordinate).
    const offsetX = e.clientX + position.x;
    const offsetY = e.clientY + position.y;

    const handleMouseMove = (e) => {
      // 2. **CORRECT:** This subtraction now correctly inverts the motion.
      // Moving right (e.clientX increases) -> newX decreases (moves container right).
      const newX = offsetX - e.clientX;
      const newY = offsetY - e.clientY;

      setPosition({
        x: newX,
        y: newY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  const handleGenerateMail = async () => {
    if (!generateMailInput.trim()) return
    if (!apiKey) {
      setError('Please set your Groq API key in the extension popup')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: EMAIL_GENERATION_PROMPT
            },
            {
              role: 'user',
              content: generateMailInput
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process text')
      }

      const data = await response.json()
      setGeneratedMail(data.choices[0].message.content)
    } catch (err) {
      setError('Failed to process text. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGrammarCheck = async () => {
    if (!inputText.trim()) return
    if (!apiKey) {
      setError('Please set your Groq API key in the extension popup')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: GRAMMAR_CHECK_PROMPT_CONCISE
            },
            {
              role: 'user',
              content: inputText
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process text')
      }

      const data = await response.json()
      setCorrectedText(data.choices[0].message.content)
    } catch (err) {
      setError('Failed to process text. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  // Message storage functions
  const addMessage = () => {
    if (!newMessageKey.trim() || !newMessageText.trim()) return

    const newMessage = {
      id: Date.now(),
      key: newMessageKey.trim(),
      text: newMessageText.trim()
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    chrome.storage.sync.set({ commonMessages: updatedMessages })

    setNewMessageKey('')
    setNewMessageText('')
  }

  const deleteMessage = (id) => {
    const updatedMessages = messages.filter(msg => msg.id !== id)
    setMessages(updatedMessages)
    chrome.storage.sync.set({ commonMessages: updatedMessages })
  }

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text)
  }

  // Add listener for text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (selectedText.length > 0) {
      setHasSelectedText(true)
    } else {
      setHasSelectedText(false)
    }
  }

  // Get selected text and populate textarea
  const captureSelectedText = () => {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()

    if (selectedText) {
      setInputText(selectedText)
      setHasSelectedText(false)
      // Clear any previous results
      setCorrectedText('')
      setError('')
    }
  }

  useEffect(() => {
    chrome.storage.local.get(["apiKey"], (result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
      }
    });

    chrome.storage.sync.get(["commonMessages"], (result) => {
      if (result.commonMessages) {
        setMessages(result.commonMessages);
      }
    });

    document.addEventListener('mouseup', handleTextSelection)
    document.addEventListener('keyup', handleTextSelection)

    return () => {
      document.removeEventListener('mouseup', handleTextSelection)
      document.removeEventListener('keyup', handleTextSelection)
    }
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div
        ref={buttonRef}
        className={`floating-button ${isDragging ? 'dragging' : ''}`}
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Squircle className="icon" />
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            ref={modalRef}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Gmail AI Assistant </h3>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <X className="icon" />
              </button>
            </div>

            <div className="modal-body">
              {/* Sidebar Navigation */}
              <div className="sidebar">
                <div
                  className={`sidebar-item ${selectedFeature === 'grammar' ? 'active' : ''}`}
                  onClick={() => setSelectedFeature('grammar')}
                >
                  <CheckCircle className="icon" />
                  <span>Grammar Check</span>
                </div>
                <div
                  className={`sidebar-item ${selectedFeature === 'generate' ? 'active' : ''}`}
                  onClick={() => setSelectedFeature('generate')}
                >
                  <Bot className="icon" />
                  <span>Generate Mail</span>
                </div>
                <div
                  className={`sidebar-item ${selectedFeature === 'storage' ? 'active' : ''}`}
                  onClick={() => setSelectedFeature('storage')}
                >
                  <MessageCircle className="icon" />
                  <span>Saved Messages</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="content-area">
                {/* Generate Mail */}
                {selectedFeature === 'generate' && (
                  <div className="grammar-section">
                    <div className="content-header">
                      <h2>Generate Mail</h2>
                      <p>Create professional emails quickly and easily</p>
                    </div>

                    <div className="input-group">
                      <label>Enter your message:</label>
                      <textarea
                        value={generateMailInput}
                        onChange={(e) => setGenerateMailInput(e.target.value)}
                        placeholder="Add any extra details or requirements (optional)...

You can mention:
• Specific deadlines or dates
• Important names or details
• Company-specific information
• Special requests or constraints
• Background information
• Attachments to reference"
                        rows={6}
                      />
                      <button
                        onClick={handleGenerateMail}
                        disabled={!generateMailInput.trim() || loading}
                        className="process-btn"
                      >
                        {loading ? <Loader2 className="icon spinning" /> : <CheckCircle className="icon" />}
                        {loading ? 'Processing...' : 'Generate Mail'}
                      </button>
                    </div>

                    {error && (
                      <div className="error-message">
                        <AlertCircle className="icon" />
                        {error}
                      </div>
                    )}

                    {generatedMail && (
                      <div className="result-group">
                        <label>Generated text:</label>
                        <div className="result-text">
                          {generatedMail}
                        </div>
                        <button
                          onClick={() => copyToClipboard(generatedMail)}
                          className="copy-btn"
                        >
                          <Copy className="icon" />
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Grammar Correction Feature */}
                {selectedFeature === 'grammar' && (
                  <div className="grammar-section">
                    <div className="content-header">
                      <h2>Grammar Check</h2>
                      <p>Fix grammar mistakes and improve your writing</p>
                    </div>

                    <div className="input-group">
                      <label>Enter your message:</label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message here..."
                        rows={6}
                      />
                      {hasSelectedText && (
                        <div className="selected-text-banner">
                          <AlertCircle className="icon" />
                          <span>Text selected! Click to import selected text</span>
                          <button onClick={captureSelectedText} className="import-btn">
                            Import Selected Text
                          </button>
                        </div>
                      )}
                      {!hasSelectedText && (
                        <div className="selected-text-banner">
                          <AlertCircle className="icon" />
                          <span>Select the specific text from mail which you want to check for grammer mistakes.</span>
                        </div>
                      )}
                      <button
                        onClick={handleGrammarCheck}
                        disabled={!inputText.trim() || loading}
                        className="process-btn"
                      >
                        {loading ? <Loader2 className="icon spinning" /> : <CheckCircle className="icon" />}
                        {loading ? 'Processing...' : 'Fix Grammar'}
                      </button>
                    </div>

                    {error && (
                      <div className="error-message">
                        <AlertCircle className="icon" />
                        {error}
                      </div>
                    )}

                    {correctedText && (
                      <div className="result-group">
                        <label>Corrected text:</label>
                        <div className="result-text">
                          {correctedText}
                        </div>
                        <button
                          onClick={() => copyToClipboard(correctedText)}
                          className="copy-btn"
                        >
                          <Copy className="icon" />
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Storage Feature */}
                {selectedFeature === 'storage' && (
                  <div className="storage-section">
                    <div className="content-header">
                      <h2>Saved Messages</h2>
                      <p>Store and manage your common email templates</p>
                    </div>

                    <div className="add-message">
                      <h4>Add New Message</h4>
                      <div className="input-group">
                        <label>Message Title:</label>
                        <input
                          type="text"
                          value={newMessageKey}
                          onChange={(e) => setNewMessageKey(e.target.value)}
                          placeholder="e.g., Meeting Follow-up"
                        />
                      </div>
                      <div className="input-group">
                        <label>Message Content:</label>
                        <textarea
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder="Enter your message template..."
                          rows={4}
                        />
                        <button
                          onClick={addMessage}
                          disabled={!newMessageKey.trim() || !newMessageText.trim()}
                          className="add-btn"
                        >
                          <Plus className="icon" />
                          Add Message
                        </button>
                      </div>
                    </div>

                    <div className="messages-list">
                      <h4>Your Saved Messages</h4>
                      {messages.length === 0 ? (
                        <p className="no-messages">No messages saved yet. Add your first template above!</p>
                      ) : (
                        <div className="messages">
                          {messages.map((message) => (
                            <div key={message.id} className="message-item">
                              <div className="message-header">
                                <strong>{message.key}</strong>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="delete-btn"
                                >
                                  <Trash2 className="icon" />
                                </button>
                              </div>
                              <div className="message-content">{message.text}</div>
                              <button
                                onClick={() => copyMessage(message.text)}
                                className="copy-btn"
                              >
                                <Copy className="icon" />
                                Copy to Clipboard
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GmailAssistant
