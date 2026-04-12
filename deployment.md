# 🚀 PetZone: Deployment Guide (To Be Live)

Follow these 4 steps to make your site "Real" and shareable with everyone.

## 1. Prepare your Code
Ensure all your local changes are saved.
1. Create a free account on [GitHub](https://github.com/).
2. Open a terminal in your project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Launch PetZone Platform"
   ```
3. Create a new repository on GitHub named `petzone-platform`.
4. Run the "Push" commands provided by GitHub (e.g., `git remote add origin...`).

## 2. Connect to Vercel
1. Go to [Vercel](https://vercel.com/) and sign up with your GitHub account.
2. Click **Add New > Project**.
3. Import your `petzone-platform` repository.

## 3. Set Environment Variables (CRITICAL)
Before clicking "Deploy", scroll down to **Environment Variables** and add these from your `.env.local` file:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY` (Your AI Key)

## 4. Deploy & Share!
Click **Deploy**. Wait 2 minutes.
Vercel will give you a link like `https://petzone-platform.vercel.app`.
**Now anyone in the world can open it on their phone!**

---

> [!TIP]
> **Firebase Security**: Make sure to go to your Firebase Console and add your new Vercel domain to the "Authorized Domains" list under **Authentication > Settings**.
