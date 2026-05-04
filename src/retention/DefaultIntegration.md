# UrduMagic Default Integration Pattern

## 🚀 COPY-PASTE INTEGRATION

### **Complete setup in 5 minutes**
- Zero configuration required
- Works with any framework
- Mobile-optimized
- Error-resilient

---

## 📦 QUICK START

### **Step 1: Install UrduMagic**
```bash
npm install urdumagic
```

### **Step 2: Add to Your App**
```html
<!-- Add to your HTML head -->
<script src="https://unpkg.com/urdumagic/dist/urdumagic.min.js"></script>
<link href="https://unpkg.com/urdumagic/dist/urdumagic.css" rel="stylesheet">
```

### **Step 3: Enable Urdu Support**
```javascript
// One-line activation
UrduMagic.enable();
```

---

## 🎪 COMPLETE INTEGRATION EXAMPLE

### **HTML Page with Urdu Support**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App - Urdu Enabled</title>
    
    <!-- UrduMagic -->
    <script src="https://unpkg.com/urdumagic/dist/urdumagic.min.js"></script>
    <link href="https://unpkg.com/urdumagic/dist/urdumagic.css" rel="stylesheet">
    
    <style>
        /* Your app styles */
        body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .urdu-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .btn:hover {
            background: #2563eb;
        }
        
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        .comments-section {
            margin-top: 40px;
        }
        
        .comment {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        .comment-author {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .comment-text {
            line-height: 1.5;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #6b7280;
        }
        
        .error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Language Toggle -->
        <button class="urdu-toggle" id="languageToggle">اردو</button>
        
        <!-- Header -->
        <header class="header">
            <h1>My Application</h1>
            <p>Experience seamless Urdu language support</p>
        </header>
        
        <!-- Contact Form -->
        <section class="contact-form">
            <h2>Contact Us</h2>
            <form id="contactForm">
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="message">Message *</label>
                    <textarea id="message" name="message" rows="4" required></textarea>
                </div>
                
                <button type="submit" class="btn">Send Message</button>
            </form>
        </section>
        
        <!-- Comments Section -->
        <section class="comments-section">
            <h2>Comments</h2>
            <div id="commentsList">
                <div class="comment">
                    <div class="comment-author">Ahmed</div>
                    <div class="comment-text">Great app! Very useful.</div>
                </div>
                <div class="comment">
                    <div class="comment-author">Fatima</div>
                    <div class="comment-text">salam dost, kya haal hai?</div>
                </div>
            </div>
            
            <!-- Add Comment Form -->
            <form id="commentForm">
                <div class="form-group">
                    <label for="commentName">Your Name</label>
                    <input type="text" id="commentName" required>
                </div>
                
                <div class="form-group">
                    <label for="commentText">Your Comment</label>
                    <textarea id="commentText" rows="3" required></textarea>
                </div>
                
                <button type="submit" class="btn">Add Comment</button>
            </form>
        </section>
    </div>
    
    <script>
        // UrduMagic Integration
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize UrduMagic
            UrduMagic.enable({
                // Configuration options
                liveTyping: true,
                autoTranslate: true,
                languageToggle: true,
                formEnhancement: true,
                commentProcessing: true,
                searchEnhancement: true,
                
                // Custom settings
                theme: 'light',
                debounceMs: 300,
                showPreview: true,
                autoCommit: false
            });
            
            // Language toggle functionality
            const languageToggle = document.getElementById('languageToggle');
            let isUrdu = false;
            
            languageToggle.addEventListener('click', async function() {
                if (!isUrdu) {
                    // Convert to Urdu
                    await UrduMagic.translatePage('body');
                    languageToggle.textContent = 'English';
                    isUrdu = true;
                } else {
                    // Revert to English
                    location.reload();
                }
            });
            
            // Contact form enhancement
            const contactForm = document.getElementById('contactForm');
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData);
                
                // Get Urdu versions if available
                const urduData = await UrduMagic.getFormUrduData(contactForm);
                
                // Submit form with both English and Urdu data
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...data,
                            urduFields: urduData
                        })
                    });
                    
                    if (response.ok) {
                        alert('Message sent successfully!');
                        contactForm.reset();
                    } else {
                        throw new Error('Failed to send message');
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            });
            
            // Comment form enhancement
            const commentForm = document.getElementById('commentForm');
            const commentsList = document.getElementById('commentsList');
            
            commentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = document.getElementById('commentName').value;
                const text = document.getElementById('commentText').value;
                
                // Auto-translate comment if it's Roman Urdu
                const translatedText = await UrduMagic.auto(text);
                
                // Add comment to list
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <div class="comment-author">${name}</div>
                    <div class="comment-text">${translatedText}</div>
                `;
                
                commentsList.insertBefore(commentDiv, commentsList.firstChild);
                commentForm.reset();
            });
            
            // Process existing comments
            UrduMagic.processComments(commentsList);
            
            // Add live typing to all text inputs
            UrduMagic.addLiveTyping('input[type="text"], textarea');
            
            // Add search enhancement if search exists
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
                UrduMagic.enhanceSearch(searchInput);
            }
        });
    </script>
</body>
</html>
```

---

## ⚛️ REACT INTEGRATION

### **React App with UrduMagic**
```typescript
// App.tsx
import React, { useEffect } from 'react';
import UrduMagic from 'urdumagic';
import { UrduMagicProvider, useUrduToggle, useTransliterationInput } from 'urdumagic/react';

// Main App Component
function App() {
    return (
        <UrduMagicProvider config={{
            liveTyping: true,
            autoTranslate: true,
            theme: 'light'
        }}>
            <Header />
            <ContactForm />
            <CommentsSection />
        </UrduMagicProvider>
    );
}

// Header with Language Toggle
function Header() {
    const { language, content, toggle } = useUrduToggle(
        "Welcome to our application! Experience seamless Urdu language support."
    );
    
    return (
        <header className="header">
            <h1>{content}</h1>
            <button onClick={toggle} className="language-toggle">
                {language === 'en' ? 'اردو' : 'English'}
            </button>
        </header>
    );
}

// Enhanced Contact Form
function ContactForm() {
    const {
        values,
        urduValues,
        errors,
        isSubmitting,
        handleChange,
        handleUrduToggle,
        handleSubmit
    } = useUrduForm({
        initialValues: { name: '', email: '', message: '' },
        urduFields: ['name', 'message'],
        onSubmit: async (values, urduFields) => {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, urduFields })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            
            alert('Form submitted successfully!');
        }
    });
    
    return (
        <section className="contact-form">
            <h2>Contact Us</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name *</label>
                    <input
                        type="text"
                        value={values.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? 'error' : ''}
                    />
                    {urduValues.name && (
                        <div className="urdu-preview">
                            {urduValues.name}
                            <button
                                type="button"
                                onClick={() => handleUrduToggle('name')}
                                className="use-urdu-btn"
                            >
                                Use Urdu
                            </button>
                        </div>
                    )}
                    {errors.name && <div className="error">{errors.name}</div>}
                </div>
                
                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <div className="error">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                    <label>Message *</label>
                    <textarea
                        value={values.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className={errors.message ? 'error' : ''}
                        rows={4}
                    />
                    {urduValues.message && (
                        <div className="urdu-preview">
                            {urduValues.message}
                            <button
                                type="button"
                                onClick={() => handleUrduToggle('message')}
                                className="use-urdu-btn"
                            >
                                Use Urdu
                            </button>
                        </div>
                    )}
                    {errors.message && <div className="error">{errors.message}</div>}
                </div>
                
                <button type="submit" disabled={isSubmitting} className="btn">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </section>
    );
}

// Comments Section with Auto-Translation
function CommentsSection() {
    const [comments, setComments] = React.useState([
        { author: 'Ahmed', text: 'Great app! Very useful.' },
        { author: 'Fatima', text: 'salam dost, kya haal hai?' }
    ]);
    
    const { translateBatch, isTranslating } = useAutoTranslate({
        targetLanguage: 'auto',
        onTranslate: (original, translated) => {
            console.log(`Translated: ${original} → ${translated}`);
        }
    });
    
    const [translatedComments, setTranslatedComments] = React.useState<string[]>([]);
    
    React.useEffect(() => {
        const translateComments = async () => {
            const texts = comments.map(c => c.text);
            const translated = await translateBatch(texts);
            setTranslatedComments(translated);
        };
        
        translateComments();
    }, [comments, translateBatch]);
    
    const handleAddComment = async (author: string, text: string) => {
        const translatedText = await UrduMagic.auto(text);
        setComments(prev => [...prev, { author, text: translatedText }]);
    };
    
    return (
        <section className="comments-section">
            <h2>Comments</h2>
            {isTranslating && <div className="loading">Translating comments...</div>}
            
            {translatedComments.map((comment, index) => (
                <div key={index} className="comment">
                    <div className="comment-author">{comments[index].author}</div>
                    <div className="comment-text">{comment}</div>
                </div>
            ))}
            
            <CommentForm onAddComment={handleAddComment} />
        </section>
    );
}

// Comment Form Component
function CommentForm({ onAddComment }: { onAddComment: (author: string, text: string) => void }) {
    const {
        value: authorValue,
        handleChange: handleAuthorChange,
        reset: resetAuthor
    } = useTransliterationInput('', { debounceMs: 200 });
    
    const {
        value: textValue,
        preview: textPreview,
        handleChange: handleTextChange,
        reset: resetText
    } = useTransliterationInput('', { debounceMs: 200, showPreview: true });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authorValue.trim() && textValue.trim()) {
            onAddComment(authorValue, textValue);
            resetAuthor();
            resetText();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
                <label>Your Name</label>
                <input
                    type="text"
                    value={authorValue}
                    onChange={handleAuthorChange}
                    placeholder="Type your name..."
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Your Comment</label>
                <textarea
                    value={textValue}
                    onChange={handleTextChange}
                    placeholder="Type your comment..."
                    rows={3}
                    required
                />
                {textPreview && (
                    <div className="urdu-preview">
                        {textPreview}
                    </div>
                )}
            </div>
            
            <button type="submit" className="btn">Add Comment</button>
        </form>
    );
}

export default App;
```

---

## 🎯 VUE.JS INTEGRATION

### **Vue App with UrduMagic**
```vue
<!-- App.vue -->
<template>
    <div id="app">
        <Header />
        <ContactForm />
        <CommentsSection />
    </div>
</template>

<script>
import UrduMagic from 'urdumagic';

export default {
    name: 'App',
    mounted() {
        // Initialize UrduMagic
        UrduMagic.enable({
            liveTyping: true,
            autoTranslate: true,
            theme: 'light'
        });
    }
};
</script>

<!-- Header.vue -->
<template>
    <header class="header">
        <h1>{{ content }}</h1>
        <button @click="toggle" class="language-toggle">
            {{ language === 'en' ? 'اردو' : 'English' }}
        </button>
    </header>
</template>

<script>
import UrduMagic from 'urdumagic';

export default {
    name: 'Header',
    data() {
        return {
            language: 'en',
            content: 'Welcome to our application! Experience seamless Urdu language support.',
            originalContent: 'Welcome to our application! Experience seamless Urdu language support.'
        };
    },
    methods: {
        async toggle() {
            if (this.language === 'en') {
                this.content = await UrduMagic.auto(this.originalContent);
                this.language = 'ur';
            } else {
                this.content = this.originalContent;
                this.language = 'en';
            }
        }
    }
};
</script>
```

---

## 📱 MOBILE APP INTEGRATION

### **React Native with UrduMagic**
```typescript
// UrduMagicService.ts
import UrduMagic from 'urdumagic';

export class UrduMagicService {
    private static instance: UrduMagicService;
    
    static getInstance(): UrduMagicService {
        if (!UrduMagicService.instance) {
            UrduMagicService.instance = new UrduMagicService();
        }
        return UrduMagicService.instance;
    }
    
    async transliterate(text: string): Promise<string> {
        try {
            return await UrduMagic.toUrdu(text);
        } catch (error) {
            console.error('Transliteration failed:', error);
            return text;
        }
    }
    
    async autoTranslate(text: string): Promise<string> {
        try {
            return await UrduMagic.auto(text);
        } catch (error) {
            console.error('Translation failed:', error);
            return text;
        }
    }
    
    async batchTranslate(texts: string[]): Promise<string[]> {
        try {
            return await UrduMagic.batch(texts);
        } catch (error) {
            console.error('Batch translation failed:', error);
            return texts;
        }
    }
}

// ChatInput.tsx
import React, { useState } from 'react';
import { UrduMagicService } from './UrduMagicService';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
    const [text, setText] = useState('');
    const [preview, setPreview] = useState('');
    const [isTransliterating, setIsTransliterating] = useState(false);
    
    const urduMagic = UrduMagicService.getInstance();
    
    const handleChange = async (value: string) => {
        setText(value);
        
        if (value.trim()) {
            setIsTransliterating(true);
            try {
                const transliterated = await urduMagic.transliterate(value);
                setPreview(transliterated);
            } catch (error) {
                setPreview('');
            } finally {
                setIsTransliterating(false);
            }
        } else {
            setPreview('');
        }
    };
    
    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
            setPreview('');
        }
    };
    
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={text}
                onChangeText={handleChange}
                placeholder="Type Roman Urdu..."
                multiline
                maxLength={500}
            />
            
            {preview ? (
                <View style={styles.previewContainer}>
                    <Text style={styles.preview}>{preview}</Text>
                </View>
            ) : null}
            
            {isTransliterating && (
                <Text style={styles.loading}>Converting...</Text>
            )}
            
            <TouchableOpacity
                style={[styles.sendButton, !text.trim() && styles.disabled]}
                onPress={handleSend}
                disabled={!text.trim()}
            >
                <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    previewContainer: {
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    preview: {
        fontSize: 16,
        textAlign: 'right',
        fontFamily: 'NotoNastaliqUrdu',
    },
    loading: {
        textAlign: 'center',
        color: '#666',
        marginTop: 8,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    disabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
```

---

## 🎯 INTEGRATION CHECKLIST

### **Before Going Live**
- [ ] **Install UrduMagic**: `npm install urdumagic`
- [ ] **Add script tag**: Include UrduMagic in HTML head
- [ ] **Enable UrduMagic**: Call `UrduMagic.enable()`
- [ ] **Test forms**: Verify form enhancement works
- [ ] **Test inputs**: Check live typing functionality
- [ ] **Test comments**: Verify comment processing
- [ ] **Test toggle**: Ensure language toggle works
- [ ] **Mobile testing**: Verify responsive design
- [ ] **Error handling**: Test network failures
- [ ] **Performance**: Check loading times

### **Optional Enhancements**
- [ ] **Custom styling**: Override default CSS
- [ ] **Configuration**: Customize behavior
- [ ] **Analytics**: Track Urdu usage
- [ ] **A/B testing**: Test Urdu vs English versions
- [ ] **User preferences**: Save language choice
- [ ] **SEO optimization**: Add hreflang tags

---

## 🚀 DEPLOYMENT READY

### **Production Configuration**
```javascript
// Production-ready configuration
UrduMagic.enable({
    // Core features
    liveTyping: true,
    autoTranslate: true,
    languageToggle: true,
    formEnhancement: true,
    commentProcessing: true,
    
    // Performance settings
    debounceMs: 300,
    cacheEnabled: true,
    batchSize: 10,
    
    // User experience
    showPreview: true,
    autoCommit: false,
    theme: 'light',
    
    // Analytics and monitoring
    analytics: true,
    errorTracking: true,
    performanceMonitoring: true,
    
    // Development settings (disable in production)
    debug: false,
    verbose: false
});
```

This default integration pattern makes it incredibly easy for developers to add comprehensive Urdu support to any application with minimal setup and maximum impact.
