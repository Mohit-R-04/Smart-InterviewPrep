# 🚀 Secure Deployment Guide (Netlify)

Your API key is now **100% secure**! It lives on the server, never exposed to users.

## **Quick Deploy to Netlify (FREE)**

### **Step 1: Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select `Mohit-R-04/Smart-InterviewPrep`
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **Deploy**

### **Step 2: Add Your API Key (Securely)**
1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. **Key**: `GEMINI_API_KEY`
4. **Value**: `AIzaSy...` (your NEW API key - revoke the old one!)
5. Click **Save**

### **Step 3: Redeploy**
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 2-3 minutes
4. Your site is live with AI features! 🎉

---

## **How It Works**

### **Before (INSECURE ❌)**
```
User Browser → Gemini API (with exposed key in JavaScript)
```

### **After (SECURE ✅)**
```
User Browser → Netlify Function → Gemini API (key on server)
```

**Your API key never leaves the server!**

---

## **Your New URLs**

- **Netlify Site**: `https://your-site-name.netlify.app`
- **Custom Domain** (optional): Add in Netlify settings

---

## **Important: Revoke Old Key!**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Delete** the exposed key: `AIzaSyAAV70OjOtSyetTNbSMQLdgFbdQFBRoBm8`
3. **Create** a new key
4. **Add** new key to Netlify environment variables

---

## **Benefits**

✅ **Secure**: API key never exposed to users  
✅ **Free**: Netlify free tier is generous  
✅ **Fast**: CDN-powered global deployment  
✅ **Easy**: One-click deploys from GitHub  
✅ **Scalable**: Serverless functions auto-scale  

---

## **Alternative: Vercel**

If you prefer Vercel:
1. Rename `netlify/functions` to `api`
2. Deploy to [vercel.com](https://vercel.com)
3. Add `GEMINI_API_KEY` in Vercel environment variables

---

**Your app is now production-ready and secure! 🔒**
