# V2 Implementation Guide — Richting C (Organisch-Warm)

## ✅ GEIMPLEMENTEERD

### 1. Design System (CSS)
- **File:** `src/styles/v2-organisch.css`
- **Tokens:** Sage green (#2f5d46), cream (#faf6ef), gold (#d4b896)
- **Typografie:** Serif (Lora) koppen, sans-serif body, fluid sizing
- **Components:** Button, card, input, badge, link classes (`.v2-btn`, `.v2-card`, etc.)
- **Scope:** Alle CSS uses `--v2-*` variables (geen conflict met v1)

### 2. Route Structure
```
/                 ← Huiding design (ongewijzigd)
/v2               ← Nieuwe homepage
/v2/apps          ← Nieuw dashboard
/v2/apps/[slug]   ← Nieuwe tool shell
```

### 3. Components (V2-specific)
- **V2Header.tsx** - Navigation + design switcher
- **V2Footer.tsx** - Footer met links
- **V2AppDashboard.tsx** - App discovery, search, filtering
- All wrapped in `.v2-root` for CSS scoping

### 4. Pages
- **page.tsx** - Homepage hero + 3 scenario cards (illustrated)
- **apps/page.tsx** - Dashboard
- **apps/[slug]/page.tsx** - Tool shell (hergebruikt `AppRenderer`)

### 5. Backward Compatibility
- **Huiding design ONGEWIJZIGD:**
  - `/` still works
  - `/apps/[slug]` still works
  - All existing components work
- **Design Switcher:** Small "v2 →" link in v1 header, "v1" link in v2 header

### 6. Reused Logic
- `appRegistry` (auto-generated, same for both)
- `toolGroups` (same for both)
- `AppRenderer.tsx` (same for both)
- `Calculator.tsx` per tool (same for both)
- All calculations identical

---

## 📋 NEXT STEPS (Todo)

### Phase 1: Polish & Testing
- [ ] Run `npm run build` to verify no errors
- [ ] Run `npm run lint` to fix any linting issues
- [ ] Test `/v2` in browser
- [ ] Test `/v2/apps` in browser
- [ ] Test `/v2/apps/duo-maandbedrag` (or any tool)
- [ ] Verify `/` still works (v1)
- [ ] Verify `/apps/duo-maandbedrag` still works (v1)

### Phase 2: UI Polish (Optional Enhancements)
- [ ] Add illustration assets (SVGs or icons) to scenario cards
- [ ] Fine-tune spacing/padding on mobile
- [ ] Add `prefers-reduced-motion` support (already in CSS)
- [ ] Add loading states to AppRenderer wrapper
- [ ] Add empty state (if no apps found)

### Phase 3: Content & Copy
- [ ] Review hero text ("Wat staat je te wachten?")
- [ ] Review scenario card descriptions
- [ ] Review footer text
- [ ] Ensure Dutch tone is conversational (no "salestech")

### Phase 4: Mobile Optimization
- [ ] Test on iPhone 13 mini (375px)
- [ ] Test on iPad (768px)
- [ ] Verify no horizontal scroll
- [ ] Verify touch targets ≥ 44px
- [ ] Verify keyboard navigation works

### Phase 5: Analytics & Monitoring
- [ ] Add page view tracking (/v2, /v2/apps, /v2/apps/[slug])
- [ ] Track which design version users visit
- [ ] Monitor performance (Core Web Vitals)

---

## 🎨 DESIGN TOKENS REFERENCE

### Colors
```css
--v2-cream: #faf6ef                  /* Background */
--v2-sage: #2f5d46                   /* Primary accent */
--v2-sage-light: #5a7d6b             /* Lighter sage */
--v2-gold: #d4b896                   /* Accent gold */
--v2-text-primary: #1a3d2a           /* Main text */
--v2-text-secondary: #3d5746         /* Secondary text */
--v2-text-muted: #6b8375             /* Muted text */
```

### Spacing
```css
--v2-space-sm: 0.5rem
--v2-space-md: 1rem
--v2-space-lg: 1.5rem
--v2-space-xl: 2rem
--v2-space-2xl: 3rem
--v2-space-3xl: 4rem
--v2-space-4xl: 6rem
```

### Border Radius
```css
--v2-radius-lg: 1rem
--v2-radius-xl: 1.5rem
--v2-radius-2xl: 2rem
--v2-radius-3xl: 3rem         /* Used for buttons, cards */
```

---

## 🔄 DESIGN SWITCHER

### For Users
- **v1 header:** Small "v2 →" link (right side)
- **v2 header:** Small "v1" link (right side)
- Direct URL navigation:
  - `/` = v1
  - `/v2` = v2
  - `/apps/X` = v1
  - `/v2/apps/X` = v2

### For Admins/Testers
- Set canonical URL to `/v2` if you want new design as default
- Monitor both routes separately
- Consider A/B testing if launching to users

---

## 📊 CURRENT STATE

### Implemented
✅ Design system (CSS tokens)
✅ Layout (`src/app/v2/layout.tsx`)
✅ Header/Footer components
✅ Homepage (`src/app/v2/page.tsx`) - with scenario cards
✅ Dashboard (`src/app/v2/apps/page.tsx`) - with search/filter
✅ Tool shell (`src/app/v2/apps/[slug]/page.tsx`) - uses AppRenderer
✅ Backward compatibility (v1 untouched)
✅ Design switcher links

### Not Yet Implemented
❌ Illustration assets (using emoji placeholders for now)
❌ Advanced animations (core functionality works, polish can follow)
❌ Analytics tracking
❌ Form validation UI (inherited from AppRenderer)

---

## 🚀 DEPLOYMENT

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000 (v1)
# Visit http://localhost:3000/v2 (v2)
```

### Build Verification
```bash
npm run build      # Should complete without errors
npm run lint       # Should pass
npm run typecheck  # Should pass
```

### Deployment Strategy
1. Deploy to staging first
2. Test both routes thoroughly
3. Deploy to production (no breaking changes)
4. Monitor analytics (which design gets traffic?)
5. Keep both designs running in parallel (no sunset yet)

---

## 📝 FILES CREATED

### Styling
- `src/styles/v2-organisch.css` — Design tokens + component classes

### Routing
- `src/app/v2/layout.tsx` — Wrapper layout for v2 routes
- `src/app/v2/page.tsx` — Homepage
- `src/app/v2/apps/page.tsx` — Dashboard
- `src/app/v2/apps/[slug]/page.tsx` — Tool shell

### Components
- `src/components/v2/V2Header.tsx` — Navigation + design switcher
- `src/components/v2/V2Footer.tsx` — Footer
- `src/components/v2/V2AppDashboard.tsx` — App discovery logic

### Documentation
- `V2_DESIGN_DIRECTIONS.md` — Original design brief
- `V2_IMPLEMENTATION_GUIDE.md` — This file

---

## 🎯 NEXT IMMEDIATE STEP

1. Run build/lint to catch any issues
2. Test `/v2` locally
3. Decide on illustration assets (SVG or emoji placeholders?)
4. Polish copy/content as needed
5. Deploy to staging for user testing

