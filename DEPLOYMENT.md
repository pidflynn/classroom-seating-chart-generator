# Deployment Guide: Classroom Seating Chart Generator

## 🚀 Quick Deployment to GitHub Pages (Recommended)

### Prerequisites
- GitHub account (free)
- Git installed on your computer

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click "New repository" (green button)
3. Name it: `classroom-seating-chart` (or any name you prefer)
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Your Files
1. Clone the empty repository:
   ```bash
   git clone https://github.com/YOURUSERNAME/classroom-seating-chart.git
   cd classroom-seating-chart
   ```

2. Copy the contents of the `dist` folder to your repository:
   ```bash
   cp /path/to/this/project/dist/* .
   ```

3. Add, commit, and push:
   ```bash
   git add .
   git commit -m "Deploy classroom seating chart generator"
   git push origin main
   ```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

### Step 4: Access Your App
- Your app will be live at: `https://YOURUSERNAME.github.io/classroom-seating-chart`
- It may take 5-10 minutes for the first deployment

---

## 🌐 Alternative: Netlify Deployment (Drag & Drop)

### Super Easy Option:
1. Go to [netlify.com](https://netlify.com) and sign up (free)
2. Drag the `dist` folder directly onto the Netlify deploy area
3. Your app will be live immediately at a random URL
4. Optional: Change the site name in settings

---

## 💻 Alternative: Desktop App (Future Option)

If teachers need offline access, we can create an Electron desktop app that:
- Works without internet
- Installs like regular software
- File size: ~150MB

---

## 📱 Features Working in Deployed Version

✅ **Upload student lists** (Excel/CSV)  
✅ **Drag & drop layout editor**  
✅ **Seating algorithms**  
✅ **PDF export**  
✅ **Save/load configurations**  
✅ **Mobile responsive**  
✅ **Works offline after first load**  

## 🔧 Updates

To update the deployed version:
1. Run `npm run build` in this project
2. Replace the files in your GitHub repository with new `dist` files
3. Push changes - updates appear automatically

## 🎓 School Usage Tips

- **Share the URL** with all teachers
- **Bookmark it** for easy access
- **Works on tablets** for classroom use
- **No installation** required
- **No IT support** needed

## Support

The app runs entirely in the browser - no server maintenance required!