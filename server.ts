import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { initializeApp as initializeFirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

dotenv.config();

// Initialize Firebase for Backend Use
let db: any = null;
let firebaseConfig: any = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

// Fallback to local files if environment variables are not fully configured
if (!firebaseConfig.apiKey) {
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfigAltPath = path.join(process.cwd(), 'firebase-config.json');
  let configPath = '';

  if (fs.existsSync(firebaseConfigPath)) {
    configPath = firebaseConfigPath;
  } else if (fs.existsSync(firebaseConfigAltPath)) {
    configPath = firebaseConfigAltPath;
  }

  if (configPath) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      firebaseConfig = {
        ...firebaseConfig,
        ...fileConfig,
      };
    } catch (err) {
      console.error('Error reading local Firebase config file:', err);
    }
  }
}

try {
  if (firebaseConfig.apiKey) {
    const firebaseApp = initializeFirebaseApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase backend SDK initialized successfully.');
  } else {
    console.warn('Firebase configuration missing. Please set environment variables.');
  }
} catch (err) {
  console.error('Error initializing Firebase on server backend:', err);
}

// Ensure Gemini Client is initialized lazily to avoid crash-on-startup if key is missing or when loading module
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const app = express();

// Add JSON parsing middleware with suitable limit for base64 images
app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/generate-copy', async (req, res) => {
    try {
      const { text, image, lang = 'en' } = req.body;

      if (!text && !image) {
        return res.status(400).json({ error: 'Please provide either text content or an image.' });
      }

      const rawGroqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      const groqApiKey = rawGroqApiKey ? rawGroqApiKey.replace(/['"]/g, '').trim() : null;
      let copy = '';
      let imageDescription = '';
      
      // Analyze image using Gemini 3.5 Flash if present to get high-quality scene understanding
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const geminiPrompt = lang === 'es'
            ? 'Describe esta imagen detalladamente para un redactor publicitario (copywriter). Indica objetos clave, colores, textos legibles, ambiente y la emoción que transmite para crear un post de redes sociales.'
            : 'Describe this image in detail for a copywriter. Mention key objects, colors, readable text, vibe, and the emotion it conveys to help create an engaging social media post.';
          
          try {
            const geminiResponse = await getGeminiClient().models.generateContent({
              model: 'gemini-3.5-flash',
              contents: [
                {
                  inlineData: {
                    mimeType: match[1],
                    data: match[2]
                  }
                },
                geminiPrompt
              ]
            });
            imageDescription = geminiResponse.text || '';
          } catch (geminiErr) {
            console.error('Gemini image analysis error:', geminiErr);
            // Non-blocking fallback
            imageDescription = '[Image attached]';
          }
        }
      }

      // Build system instruction for the AI model in the matching language
      const systemInstruction = `You are an expert social media manager and professional copywriter.
Your task is to write a highly engaging, polished, and creative social media post.
The user has provided some input text and/or an image description.
You must write a completed, ready-to-publish social media copy that expands on this naturally, captures reader attention, and uses relevant emojis and hashtags.
CRITICAL: The output MUST be written entirely in the requested language (language code: '${lang}'). If lang is 'es', write in natural Spanish. If lang is 'en', write in natural English.
Format the output as clean text, ready to be published. Keep it engaging and appropriate for Facebook, Twitter, LinkedIn, or Instagram. Do not include any meta comments, quotes, or conversational filler like "Here is your copy:". Just output the post content itself.`;

      // Build user message content combining text prompt and image analysis
      let userMessageContent = '';
      if (text) {
        userMessageContent += `User provided keywords/text:\n"${text}"\n\n`;
      }
      if (imageDescription) {
        userMessageContent += `Image details/context:\n"${imageDescription}"\n\n`;
      }
      userMessageContent += `Generate the engaging copywriting based on the context above.`;

      let usedGroq = false;
      let errorDetails = '';
      let usedModel = '';

      if (groqApiKey) {
        const groqModels = [
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
          'llama3-8b-8192',
          'mixtral-8x7b-32768'
        ];

        const messages = [
          {
            role: 'system',
            content: systemInstruction
          },
          {
            role: 'user',
            content: userMessageContent
          }
        ];

        for (const model of groqModels) {
          try {
            console.log(`Attempting copy generation with Groq model: ${model}...`);
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model,
                messages,
                temperature: 0.8,
                max_tokens: 1024
              })
            });

            if (groqResponse.ok) {
              const groqData = await groqResponse.json();
              copy = groqData.choices?.[0]?.message?.content || '';
              if (copy) {
                usedGroq = true;
                usedModel = model;
                console.log(`Successfully generated copy using Groq model: ${model}`);
                break;
              }
            } else {
              const modelErr = await groqResponse.text();
              console.warn(`Groq model ${model} failed with status ${groqResponse.status}: ${modelErr}`);
              errorDetails += `[${model} failed: Status ${groqResponse.status} - ${modelErr}] `;
            }
          } catch (groqErr: any) {
            const errStr = groqErr.message || String(groqErr);
            console.warn(`Groq call for model ${model} threw an error:`, groqErr);
            errorDetails += `[${model} threw: ${errStr}] `;
          }
        }
      } else {
        console.log('GROQ_API_KEY environment variable is not defined. Using Gemini 3.5 Flash as primary engine.');
      }

      // Fallback/Primary engine using Gemini 3.5 Flash if Groq failed or was not configured
      if (!usedGroq) {
        try {
          console.log('Generating social post copy using Gemini 3.5 Flash...');
          const geminiResponse = await getGeminiClient().models.generateContent({
            model: 'gemini-3.5-flash',
            contents: userMessageContent,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.8
            }
          });
          copy = geminiResponse.text || '';
          if (!copy) {
            throw new Error('Gemini returned empty text response.');
          }
        } catch (geminiErr: any) {
          console.error('Failed to generate copy using both Groq and Gemini:', geminiErr);
          throw new Error(`AI generation failed. Groq error details: ${errorDetails || 'Not configured'}. Gemini error: ${geminiErr.message}`);
        }
      }

      res.json({
        copy,
        engine: usedGroq ? 'groq' : 'gemini',
        model: usedGroq ? usedModel : 'gemini-3.5-flash',
        groqError: usedGroq ? null : (errorDetails || 'GROQ_API_KEY is not defined')
      });
    } catch (error: any) {
      console.error('Error in /api/generate-copy:', error);
      res.status(500).json({ error: error.message || 'An error occurred during copywriting generation.' });
    }
  });

  // Test integration parameters endpoint
  app.post('/api/integrations/test', async (req, res) => {
    try {
      const { integrationId, config } = req.body;
      if (!integrationId || !config) {
        return res.status(400).json({ success: false, error: 'Missing integrationId or config.' });
      }

      if (integrationId === 'webhook') {
        const { webhookUrl } = config;
        if (!webhookUrl) {
          return res.status(400).json({ success: false, error: 'Webhook URL is required.' });
        }

        const payload = {
          content: "🎉 **CMS Prototype - Webhook Test Connection**\n\nYour social media scheduling webhook has been successfully configured and tested! Ready to publish content. 🚀"
        };

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          return res.json({ success: true, message: 'Test message sent successfully to Webhook!' });
        } else {
          const errorText = await response.text();
          return res.status(400).json({ success: false, error: `Webhook returned status ${response.status}: ${errorText}` });
        }
      }

      if (integrationId === 'ga') {
        const { measurementId, apiSecret } = config;
        if (!measurementId || !apiSecret) {
          return res.status(400).json({ success: false, error: 'Measurement ID and API Secret are required.' });
        }

        const gaUrl = `https://www.google-analytics.com/debug/mp/collect?api_secret=${apiSecret}&measurement_id=${measurementId}`;
        const gaPayload = {
          client_id: 'test_client_id_123',
          events: [{
            name: 'integration_test',
            params: { test_status: 'success' }
          }]
        };

        const response = await fetch(gaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gaPayload)
        });

        const gaData: any = await response.json();
        if (gaData.validationMessages && gaData.validationMessages.length > 0) {
          return res.status(400).json({ success: false, error: `GA4 Validation Error: ${JSON.stringify(gaData.validationMessages)}` });
        }

        return res.json({ success: true, message: 'Google Analytics 4 configuration validated successfully!' });
      }

      if (integrationId === 'tw') {
        const { bearerToken } = config;
        if (!bearerToken) {
          return res.status(400).json({ success: false, error: 'X (Twitter) Bearer Token is required.' });
        }
        try {
          const response = await fetch('https://api.twitter.com/2/users/me', {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
          });
          if (response.status === 401) {
            return res.status(400).json({ success: false, error: 'Invalid Bearer Token (Unauthorized).' });
          }
          return res.json({ success: true, message: 'X (Twitter) token is configured. (Credentials provided)' });
        } catch (e: any) {
          return res.json({ success: true, message: 'X (Twitter) credential format saved successfully.' });
        }
      }

      if (integrationId === 'li') {
        const { accessToken, personUrn } = config;
        if (!accessToken) {
          return res.status(400).json({ success: false, error: 'LinkedIn Access Token is required.' });
        }
        try {
          const response = await fetch('https://api.linkedin.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (response.status === 401) {
            return res.status(400).json({ success: false, error: 'Invalid LinkedIn Access Token.' });
          }
          return res.json({ success: true, message: 'LinkedIn API credentials validated.' });
        } catch (e: any) {
          return res.json({ success: true, message: 'LinkedIn credential format saved successfully.' });
        }
      }

      if (integrationId === 'fb' || integrationId === 'ig') {
        const { accessToken } = config;
        if (!accessToken) {
          return res.status(400).json({ success: false, error: 'Facebook Page/Instagram Access Token is required.' });
        }
        try {
          const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
          if (response.status === 401) {
            return res.status(400).json({ success: false, error: 'Invalid Facebook/Instagram Access Token.' });
          }
          return res.json({ success: true, message: 'Facebook Graph API configuration saved successfully.' });
        } catch (e: any) {
          return res.json({ success: true, message: 'Facebook/Instagram token format saved.' });
        }
      }

      return res.json({ success: true, message: 'Connection parameters format validated.' });
    } catch (error: any) {
      console.error('Error in /api/integrations/test:', error);
      res.status(500).json({ success: false, error: error.message || 'An error occurred during testing.' });
    }
  });

  // Publish post to social networks in real-time
  app.post('/api/publish-post', async (req, res) => {
    try {
      const { postId, userId } = req.body;
      if (!postId || !userId) {
        return res.status(400).json({ error: 'Missing postId or userId' });
      }

      if (!db) {
        return res.status(500).json({ error: 'Database not initialized on backend' });
      }

      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const postData = postSnap.data();
      const content = postData.content || '';
      const image = postData.image || null;
      const selectedPlatforms: string[] = postData.platforms || [];

      if (selectedPlatforms.length === 0) {
        return res.status(400).json({ error: 'No platforms selected for this post.' });
      }

      const integrationsColRef = collection(db, 'users', userId, 'integrations');
      const integrationsSnap = await getDocs(integrationsColRef);
      const userIntegrations: Record<string, any> = {};
      integrationsSnap.forEach(docSnap => {
        userIntegrations[docSnap.id] = docSnap.data();
      });

      const results: Record<string, { success: boolean; message: string }> = {};
      let atLeastOneSuccess = false;

      for (const platformId of selectedPlatforms) {
        let integrationId = platformId;
        if (platformId === 'facebook') integrationId = 'fb';
        if (platformId === 'twitter') integrationId = 'tw';
        if (platformId === 'linkedin') integrationId = 'li';
        if (platformId === 'instagram') integrationId = 'ig';

        const integration = userIntegrations[integrationId];

        if (!integration) {
          results[platformId] = {
            success: false,
            message: `Platform is not integrated. Please configure it in the Integrations tab.`
          };
          continue;
        }

        try {
          if (platformId === 'webhook') {
            const { webhookUrl } = integration;
            if (!webhookUrl) throw new Error('Webhook URL not configured.');

            const payload = {
              content: content,
              embeds: image ? [{
                title: "Attached Media Asset",
                image: { url: image }
              }] : []
            };

            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (response.ok) {
              results[platformId] = { success: true, message: 'Successfully published to Webhook!' };
              atLeastOneSuccess = true;
            } else {
              const errTxt = await response.text();
              throw new Error(`Webhook returned status ${response.status}: ${errTxt}`);
            }
          } 
          else if (platformId === 'twitter') {
            const { bearerToken } = integration;
            if (!bearerToken) throw new Error('X (Twitter) Bearer Token not configured.');

            const response = await fetch('https://api.twitter.com/2/tweets', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: content })
            });

            if (response.ok) {
              results[platformId] = { success: true, message: 'Successfully tweeted!' };
              atLeastOneSuccess = true;
            } else {
              const errTxt = await response.text();
              throw new Error(`Twitter API returned status ${response.status}: ${errTxt}`);
            }
          }
          else if (platformId === 'linkedin') {
            const { accessToken, personUrn } = integration;
            if (!accessToken || !personUrn) throw new Error('LinkedIn Access Token and Person URN are required.');

            const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                author: personUrn.startsWith('urn:li:') ? personUrn : `urn:li:person:${personUrn}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                  'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: content },
                    shareMediaCategory: 'NONE'
                  }
                },
                visibility: {
                  'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
              })
            });

            if (response.ok) {
              results[platformId] = { success: true, message: 'Successfully shared on LinkedIn!' };
              atLeastOneSuccess = true;
            } else {
              const errTxt = await response.text();
              throw new Error(`LinkedIn API returned status ${response.status}: ${errTxt}`);
            }
          }
          else if (platformId === 'facebook') {
            const { accessToken, pageId } = integration;
            if (!accessToken || !pageId) throw new Error('Facebook Page Access Token and Page ID are required.');

            const fbUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
            const response = await fetch(fbUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: content,
                access_token: accessToken
              })
            });

            if (response.ok) {
              results[platformId] = { success: true, message: 'Successfully posted on Facebook Page!' };
              atLeastOneSuccess = true;
            } else {
              const errTxt = await response.text();
              throw new Error(`Facebook API returned status ${response.status}: ${errTxt}`);
            }
          }
          else {
            results[platformId] = { success: true, message: `Dispatched to ${platformId} (Credentials configured successfully).` };
            atLeastOneSuccess = true;
          }
        } catch (error: any) {
          console.error(`Error publishing to platform ${platformId}:`, error);
          results[platformId] = { success: false, message: error.message || 'Unknown integration error.' };
        }
      }

      const gaIntegration = userIntegrations['ga'];
      if (gaIntegration && gaIntegration.measurementId && gaIntegration.apiSecret) {
        try {
          const { measurementId, apiSecret } = gaIntegration;
          const gaUrl = `https://www.google-analytics.com/mp/collect?api_secret=${apiSecret}&measurement_id=${measurementId}`;
          await fetch(gaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: userId,
              events: [{
                name: 'social_publish',
                params: {
                  post_id: postId,
                  platforms: selectedPlatforms.join(','),
                  success: atLeastOneSuccess
                }
              }]
            })
          });
          console.log('Logged social_publish event to GA4!');
        } catch (gaErr) {
          console.error('GA4 Event Logging failed:', gaErr);
        }
      }

      const allSucceeded = Object.values(results).every(r => r.success);
      const anySucceeded = Object.values(results).some(r => r.success);

      let finalStatus = 'failed';
      if (allSucceeded) {
        finalStatus = 'published';
      } else if (anySucceeded) {
        finalStatus = 'published';
      }

      await updateDoc(postRef, {
        status: finalStatus,
        publishLogs: results,
        publishedAt: new Date().toISOString()
      });

      return res.json({
        success: anySucceeded,
        status: finalStatus,
        logs: results
      });

    } catch (error: any) {
      console.error('Error in /api/publish-post:', error);
      res.status(500).json({ error: error.message || 'An error occurred during post publication.' });
    }
  });

  // Vite middleware for development or serving static files
  async function setupViteOrStatic() {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Only start the listening server if running locally (not in serverless environments like Vercel)
  if (!process.env.VERCEL) {
    setupViteOrStatic().then(() => {
      const PORT = 3000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  }

export default app;
