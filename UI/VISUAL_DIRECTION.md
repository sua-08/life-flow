# Life Flow — Visual Direction

Status: Approved visual direction.
Implementation timing: V6 — Visual Design.

This document defines the visual identity of Life Flow.

Do not implement this visual direction before V6 unless the user explicitly requests a visual prototype.

Functional behavior, data rules, drag-and-drop behavior, current/completed/skipped state logic, and the 2×2 Flow layout are defined elsewhere and must not be changed merely to accommodate visual styling.

---

# 1. Visual Concept

Life Flow should feel like:

> A small personal desktop diary from an imagined Y2K computer,
> decorated by hand with soft pastel colors, imperfect pixel lines,
> tiny stickers, memo scraps, and gentle retro window frames.

The target is NOT:

- a modern productivity dashboard
- a clean SaaS application
- a cyberpunk retro interface
- a hard-edged 8-bit game UI
- a glossy mobile app
- a generic pastel website

The desired feeling is:

- soft
- personal
- slightly clumsy
- handmade
- nostalgic
- quiet
- playful
- warm
- small and detailed
- gently imperfect

The app should feel like a private digital desk or diary rather than business software.

---

# 2. Primary Visual Reference

The main reference is a pastel Y2K desktop-style illustration with:

- old computer window frames
- pale pink UI chrome
- cream backgrounds
- baby blue and lavender accents
- slightly crooked pixel-like outlines
- low-contrast pastel colors
- small decorative windows and notes
- scrapbook-like overlapping objects
- imperfect handmade visual rhythm

The most important point is NOT simply "pink pixel art."

The key combination is:

> soft Y2K window UI
> + imperfect pixel lines
> + faded pastel palette
> + scrapbook layering
> + handmade diary feeling

When visual decisions conflict, preserve this combination.

---

# 3. Core Visual Principles

## 3.1 Imperfect rather than geometrically perfect

The UI should not feel mathematically precise.

Avoid an overly polished vector look.

Desired qualities:

- borders may feel slightly uneven
- decorative lines may have tiny irregularities
- corners do not need to feel perfectly engineered
- small decorative elements may be slightly offset
- visual alignment can contain controlled imperfection

However:

Usability must remain precise.

Interactive hit areas, drag targets, text alignment, scrolling, and layout calculations must remain technically correct.

Visual imperfection must never create functional imprecision.

---

## 3.2 Soft retro window frames

Window borders are one of the most important visual elements.

Life Flow should reference old desktop application windows, but soften them.

Use:

- thin layered borders
- pale pink
- dusty blue
- lavender
- warm cream
- subtle inner highlight
- subtle darker outer edge

The frame should feel nostalgic without becoming a direct recreation of Windows 95/98.

Avoid:

- solid black outlines
- metallic grey Windows-style chrome
- strong bevel effects
- aggressive pixel borders
- thick dark frames

Think:

> "an old computer window redrawn with pastel stationery."

---

# 4. Color Direction

The palette should be low-saturation and light.

Primary color families:

### Base
- warm ivory
- milk white
- very pale cream

### Pink
- milky pink
- dusty rose
- strawberry milk
- pale peach-pink

### Blue
- baby blue
- faded sky blue
- pale periwinkle

### Supporting accents
- soft lavender
- very pale mint
- light butter yellow
- desaturated peach

Dark text/border colors should preferably use:

- muted navy
- greyed violet
- dusty blue-grey

instead of pure black.

## Important

Do not make the interface overwhelmingly pink.

Pink and blue should coexist.

Cream/ivory should provide visual breathing room.

Approximate visual balance:

- 50–60% cream / neutral light surface
- 15–20% pink
- 15–20% blue / periwinkle
- remaining colors as small accents

These are visual guidelines, not strict CSS percentages.

---

# 5. Pixel Style

Life Flow uses pixel influence, not strict pixel-art simulation.

Use pixel qualities in:

- icons
- small decorations
- borders
- tiny arrows
- separators
- control buttons
- selected decorative typography

But keep Korean text readable.

Do NOT pixelate all text.

Do NOT intentionally reduce readability to imitate a game.

A useful distinction:

Wrong:
> "Everything must look like an 8-bit game."

Correct:
> "The interface looks like a soft diary drawn inside an old pixel-era computer."

---

# 6. Lines and Borders

Borders are one of the signature elements.

They should feel:

- thin
- slightly imperfect
- pixel-aware
- gentle
- layered

Prefer muted violet/blue outlines rather than black.

Possible visual construction:

outer muted outline
→ pastel frame
→ thin light highlight
→ cream content surface

Avoid excessive modern rounded rectangles.

Corner radius should generally be small.

Do not turn every component into a pill.

Buttons and cards may sometimes look almost rectangular, with only subtle softness.

---

# 7. Layering / Scrapbook Feeling

The interface should not feel like one perfectly flat grid.

Use restrained layering such as:

- tiny memo papers
- tabs
- clipped notes
- stickers
- decorative labels
- small stars/hearts
- taped-looking accents
- little desktop objects

Some elements may visually overlap the edge of panels.

Example:

A tiny star sticker may overlap a Time Block frame.

A memo may appear slightly attached to the side of the main window.

A decorative icon may peek out from behind a header.

However:

Decorations must remain secondary to Life Flow's actual tasks.

Do not allow decorative elements to cover:

- Flow Cards
- input fields
- drag handles
- context menus
- current state indicators
- scrollbars
- important text

---

# 8. Information Density

Life Flow should feel small and cozy.

Avoid modern layouts with huge padding.

Prefer:

- compact cards
- small gaps
- dense but readable information
- many small visual details
- short vertical distances between Flow Cards

The user should be able to see several tasks inside each Time Block without excessive scrolling.

"Large modern dashboard card" proportions are explicitly undesirable.

---

# 9. Main Life Flow Board

The core desktop layout remains:

┌─────────────────┬─────────────────┐
│ 06:00–12:00     │ 12:00–18:00     │
│ Morning         │ Afternoon       │
├─────────────────┼─────────────────┤
│ 18:00–24:00     │ 00:00–06:00     │
│ Evening         │ Night           │
└─────────────────┴─────────────────┘

This 2×2 structure is fundamental.

Do not redesign it into:

- columns
- tabs
- Kanban
- timeline
- sidebar task lists
- dashboard widgets

Each block is a vertically flowing mini-window.

Within each block:

Flow Card
   ↓
Flow Card
   ↓
Flow Card
   ↓
Add area

The vertical flow must remain visually obvious.

---

# 10. Time Block Styling

Each Time Block should resemble a small retro application window or diary panel.

Suggested personality:

### Morning
warm pink / peach / pale yellow accents

### Afternoon
baby blue / pale sky accents

### Evening
soft lavender / dusty pink accents

### Night
periwinkle / muted blue / pale violet accents

These should remain variations of one system.

Do not make the four blocks look like four unrelated themes.

The difference should be subtle.

---

# 11. Flow Card Styling

Flow Cards should NOT resemble enterprise task cards.

They should feel closer to:

- small memo strips
- diary labels
- simple old UI list items

Desired:

- compact height
- light cream or near-white surface
- thin muted border
- minimal shadow
- optional tiny pixel icon
- clear readable title

Avoid:

- large shadows
- glass effects
- gradients covering the whole card
- oversized rounded corners
- huge icons
- excessive metadata

Task title is the primary information.

---

# 12. Flow Connectors

The relationship between tasks is visually important.

The arrow between tasks should feel like part of the visual identity.

Possible direction:

Flow Card
     ↓
Flow Card
     ↓
Flow Card

The connector can use:

- small pixel arrow
- dotted line
- slightly imperfect hand-drawn arrow
- tiny decorative connector

It should remain subtle.

Do not make the Flow resemble a complex diagramming application.

---

# 13. Inputs

The Add Flow Card area should feel integrated into the panel.

It can resemble:

- an old text input
- a diary writing line
- a small memo entry field

Avoid large floating CTA buttons.

The input should be visually quiet until used.

---

# 14. Buttons

Buttons should draw from old desktop UI controls.

Possible characteristics:

- thin double border
- small rectangular shape
- tiny icon
- pastel hover state
- subtle pressed state

Buttons should feel tactile without large 3D effects.

Avoid:

- modern giant pill buttons
- neon gradients
- glassmorphism
- strong drop shadows

---

# 15. Current / Suggested / Completed / Skipped

These states must remain clearly distinguishable even after styling.

Visual identity must not reduce state clarity.

## Current

The current task is the strongest active emphasis.

Possible visual language:

- brighter pink/blue border
- tiny blinking-style or sparkle marker
- small "NOW" label
- gentle highlight behind the card

Do not rely on color alone.

---

## Suggested

Suggested is weaker than Current.

Possible:

- dotted border
- tiny arrow marker
- muted sparkle
- small indicator on edge

Current and Suggested may exist simultaneously and must not be confused.

---

## Completed

Completed should remain readable.

Possible:

- small stamp / oval mark
- muted text
- tiny check ornament

Avoid making it disappear completely.

---

## Skipped

Skipped can use:

- soft strike-through
- muted appearance
- tiny skip indicator

It must remain different from Completed.

---

# 16. Typography

Typography should support Korean readability first.

Do not use a decorative pixel font for all Korean task text.

Potential hierarchy:

### Decorative / headings
A retro or pixel-inspired typeface may be used selectively.

### Task names and functional UI
Readable Korean font.

### Small labels
Can use a mildly retro monospace/pixel-inspired treatment if readability remains good.

Overall typography should feel:

- small
- friendly
- slightly nostalgic

Avoid corporate typography with large bold headings.

---

# 17. Icons

Icons should feel like tiny handmade/pixel objects.

Examples of suitable motifs:

- heart
- star
- moon
- sun
- small folder
- clock
- note paper
- book
- tiny flower
- floppy-disk-like motif
- small computer
- cursor
- ribbon
- cloud

Use original/generic motifs.

Do not copy recognizable copyrighted characters or exact artwork from the references.

Decorative characters, if added later, should be original assets.

---

# 18. Background

Do not use a plain sterile #FFFFFF background everywhere.

Prefer:

- warm ivory
- barely visible paper-like tone
- extremely subtle pixel/noise texture

Texture must remain subtle enough that text stays clean.

No heavy grain.

No visually noisy repeating pattern behind Flow Cards.

---

# 19. Shadows

Use shadows sparingly.

Desired:

- tiny offset pixel-like shadow
- pale lavender/blue-grey shadow
- 1–3px feeling rather than large blur

Avoid:

- large floating shadows
- soft Material Design elevation
- dramatic glass glow

---

# 20. Decorative Elements

Decoration should mainly live around structural edges.

Good locations:

- Time Block headers
- corners
- application frame
- empty space
- panel edges
- small footer/header areas

Bad locations:

- directly over task text
- between densely packed controls
- inside drag/drop target areas
- covering scroll content

The product must remain usable with decorations removed.

That is a useful test.

---

# 21. Controlled Imperfection

"Imperfect" does NOT mean random CSS.

Do not implement random offsets on every render.

Do not randomly rotate interactive elements.

Do not cause layout shifts.

Controlled imperfection should be deterministic.

Examples:

Good:
- one memo is rotated by -1deg
- one decorative star is slightly offset
- a decorative border asset contains uneven pixels

Bad:
- task cards change rotation every render
- hit boxes do not match visuals
- inconsistent spacing caused by random values

---

# 22. Animation Direction

Animation belongs primarily to V7.

When added later, motion should be:

- short
- small
- playful
- responsive

Examples:

- tiny 1–2px button press
- card settles after drop
- small sparkle on completion
- subtle sticker-like pop

Avoid:

- long easing animations
- large bouncing panels
- constant background movement
- animation that delays task interaction

---

# 23. Accessibility / Practical Rules

Cute styling must not override usability.

Always preserve:

- readable Korean text
- sufficient text/background contrast
- obvious focus states
- obvious drag targets
- keyboard usability where implemented
- understandable status differences
- usable scroll areas

Do not encode important meaning using pastel color alone.

---

# 24. Explicit Anti-Patterns

Do NOT turn Life Flow into the common AI-generated application aesthetic.

Specifically avoid:

- glassmorphism
- purple-blue gradients
- giant hero-style cards
- excessive whitespace
- huge rounded corners
- floating dashboard statistics
- generic Lucide icons everywhere
- large gradient CTA buttons
- dark navy SaaS sidebar
- modern analytics dashboard layout
- neon cyber Y2K
- aggressively saturated hot pink
- strict black-and-white pixel art

If a design could easily belong to a generic startup dashboard template,
it is probably wrong for Life Flow.

---

# 25. Desired Emotional Result

When the user opens Life Flow, the first feeling should not be:

> "I need to be productive."

It should feel closer to:

> "This is my little space for today."

The user is arranging the flow of their day rather than managing a business task queue.

The visual design should reduce pressure rather than increase it.

---

# 26. Implementation Strategy for V6

Do not redesign the entire app in one pass.

Implement the visual direction in this order:

## V6.1 — Design Tokens

Define centralized tokens for:

- colors
- text colors
- borders
- spacing
- radius
- shadows
- typography
- state colors

Do not scatter arbitrary values across components.

---

## V6.2 — Outer Application Frame

Apply:

- background
- retro window frame
- main app chrome

Stop and review.

---

## V6.3 — Time Block

Style ONE Time Block first.

Confirm:

- frame
- header
- scrolling area
- add area
- compactness

Use it as the visual template for the other three.

Stop and review.

---

## V6.4 — Flow Card

Style FlowCard independently.

Confirm all states:

- pending
- current
- suggested
- completed
- skipped

Stop and review.

---

## V6.5 — Supporting UI

Then style:

- text input
- context menu
- confirmation dialog
- error notice
- scrollbar
- empty state

---

## V6.6 — Decoration

Only after functional UI is complete, add restrained:

- stickers
- memo pieces
- tiny pixel ornaments
- corner decorations

Decoration is the final layer, not the structural foundation.

---

# 27. Reference Rule

The supplied reference images are inspiration for:

- visual mood
- palette
- border language
- imperfect pixel treatment
- layering
- density
- nostalgia

Do not reproduce their characters, illustrations, compositions, or specific copyrighted visual assets.

Life Flow should have its own original interface and motifs.

---

# 28. Final Review Checklist

Before declaring V6 complete, verify:

- [ ] It still clearly looks like Life Flow's 2×2 vertical Flow interface.
- [ ] It does not resemble a generic productivity SaaS.
- [ ] Pink and blue are balanced.
- [ ] Cream/light neutral space prevents visual overload.
- [ ] Borders carry a soft retro identity.
- [ ] Pixel influence is visible but not harsh.
- [ ] The interface feels slightly handmade rather than perfectly vectorized.
- [ ] Cards remain compact.
- [ ] Korean text remains easy to read.
- [ ] Current and Suggested cannot be confused.
- [ ] Completed and Skipped cannot be confused.
- [ ] Decorations do not interfere with drag/drop or input.
- [ ] No functionality was changed solely for visual styling.
- [ ] No unapproved feature was introduced.

---

# Short Visual Summary

Life Flow should look like:

> a pastel Y2K desktop window
> that someone lovingly decorated like a diary.

Not perfectly polished.
Not messy.
Not aggressively retro.

Soft, pixel-ish, slightly crooked, compact, nostalgic, and personal.