# 🌟 Installer Tailwind CSS + DaisyUI dans un projet Next.js

---

## ✅ 1. Créer un projet Next.js

```bash
npm create next-app@latest ./
```

Suivre les instructions, tu peux décocher Tailwind (on l'ajoute proprement après).

---

## ✅ 2. Installer Tailwind CSS et DaisyUI

```bash
npm install -D tailwindcss postcss autoprefixer
npm install daisyui
```

---

## ✅ 3. Générer les fichiers de configuration

```bash
npx tailwindcss init -p
```

Cela crée :
- `tailwind.config.js`
- `postcss.config.js`

---

## ✅ 4. Configurer `tailwind.config.js`

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
```

---

## ✅ 5. Modifier `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> ❌ N’utilise pas `@import` ni `@plugin`, ça ne marche pas avec Tailwind v3+

---

## ✅ 6. Démarrer le projet

```bash
npm run dev
```

---

## 🎉 Tu peux maintenant utiliser DaisyUI

```jsx
<button className="btn btn-primary">Clic-moi</button>
```

---

## 🧠 Bonus

Tu peux personnaliser les thèmes DaisyUI :

```js
// Dans tailwind.config.js
daisyui: {
  themes: ["dark", "light"],
},
```
