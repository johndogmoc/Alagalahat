# Admin UI Design System - Visual Reference

## 🎨 Color Schemes by Page

### Dashboard (`/admin`)
**Primary Gradient**: `linear-gradient(135deg, #0052CC 0%, #003FA1 100%)`
- Header: Navy Blue gradient
- Stat cards: Various colors (Primary, Green, Orange, Red, Teal)
- Accent bar: Gradient blue
```
Colors:
- #0052CC (Primary)
- #003FA1 (Dark)
- #3B82F6 (Light blue for charts)
- #1B4F8A (Darker blue)
- #059669 (Green for pets)
- #D97706 (Orange for pending)
- #DC2626 (Red for lost)
- #2A9D8F (Teal for vax)
```

### User Management (`/admin/users`)
**Primary Gradient**: `linear-gradient(135deg, #00A67E 0%, #007A5E 100%)`
- Header: Teal/Green gradient
- Stat cards: Blue, Green, Purple, Sky variations
- Accent bar: Teal gradient
```
Colors:
- #00A67E (Primary)
- #007A5E (Dark)
- #1B4F8A (Total Users - Navy)
- #059669 (Active - Green)
- #7C3AED (Admins - Purple)
- #0369A1 (Staff - Sky)
```

### Activity Logs (`/admin/logs`)
**Primary Gradient**: `linear-gradient(135deg, #FF6B6B 0%, #E84C3D 100%)`
- Header: Coral Red gradient
- Filter buttons: Coral theme
- Accent bar: Red gradient
```
Colors:
- #FF6B6B (Primary)
- #E84C3D (Dark)
- #1B4F8A (Pet icon)
- #E76F51 (Lost pet icon)
- #2A9D8F (User icon)
- #52B788 (Vaccination icon)
```

### System Settings (`/admin/settings`)
**Primary Gradient**: `linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)`
- Header: Purple gradient
- Section icons: Various color-coded backgrounds
- Accent bar: Purple gradient
```
Colors:
- #7C3AED (Primary)
- #5B21B6 (Dark)
- #EDE9FE (Light purple bg for icon)
- #1B4F8A (Shield/Primary icon)
- #00A67E (Paw/Secondary)
- #E9C46A (Syringe/Vaccine)
- #E76F51 (Bell/Alert)
```

---

## 📐 Spacing System

```
Header:
  padding: 40px (vertical), 32px (horizontal)
  margin-bottom: 40px

Card/Section:
  padding: 28-32px
  margin-bottom: 32-40px
  gap: 16px (between elements)
  border-radius: 16-20px

Stats Row:
  grid gap: 16px
  margin-bottom: 32px

Icon Spacing:
  Icon to text: 8-10px
  Icon size: 16-28px (context dependent)
  Icon box: 48-56px square

Typography:
  Header: 36px, fontWeight 800
  Subtitle: 15px, rgba(255,255,255,0.85)
  Stat value: 32-36px, fontWeight 800
  Label: 12px, fontWeight 600, uppercase, tracking 0.05em
  Body: 14-15px, fontWeight 500
```

---

## 🎬 Component Patterns

### Premium Header Pattern
```tsx
<div style={{
  background: "linear-gradient(135deg, color1 0%, color2 100%)",
  padding: "40px 32px",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(color, 0.15)",
  color: "white",
  position: "relative",
  overflow: "hidden"
}}>
  <div style={{
    position: "absolute",
    top: 0, right: 0,
    width: 200, height: 200,
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    transform: "translate(50%, -50%)"
  }} aria-hidden="true" />
  <div style={{ position: "relative", zIndex: 1 }}>
    {/* Content here */}
  </div>
</div>
```

### Premium Stat Card Pattern
```tsx
<div style={{
  background: "var(--color-card)",
  border: "1.5px solid var(--color-border)",
  borderRadius: 16,
  padding: "28px 20px",
  boxShadow: "var(--shadow-sm)",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all var(--transition-base)"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = "var(--shadow-md)";
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.borderColor = colorValue;
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.borderColor = "var(--color-border)";
}}>
  <div style={{
    position: "absolute",
    top: -10, right: -10,
    width: 100, height: 100,
    background: bgColor,
    borderRadius: "50%",
    opacity: 0.4
  }} aria-hidden="true" />
  {/* Icon and content with position: relative, zIndex: 1 */}
</div>
```

### Premium Section Pattern
```tsx
<div style={{
  background: "var(--color-card)",
  border: "1.5px solid var(--color-border)",
  borderRadius: 18,
  boxShadow: "var(--shadow-sm)",
  overflow: "hidden",
  transition: "all var(--transition-base)"
}}>
  <div style={{
    padding: "24px 28px",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "linear-gradient(90deg, rgba(color,0.02) 0%, transparent 100%)"
  }}>
    <div style={{
      width: 48, height: 48,
      borderRadius: 14,
      background: "var(--color-primary)12",
      color: "var(--color-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 2px 8px var(--color-primary)20"
    }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
        {description}
      </p>
    </div>
  </div>
  <div style={{ padding: 28, display: "grid", gap: 20 }}>
    {/* Section content */}
  </div>
</div>
```

### Section Title Pattern
```tsx
<h2 style={{
  fontSize: 20,
  fontWeight: 800,
  margin: 0,
  marginBottom: 20,
  color: "var(--color-text)",
  letterSpacing: "-0.01em",
  display: "flex",
  alignItems: "center",
  gap: 10
}}>
  <span style={{
    width: 5,
    height: 28,
    borderRadius: 3,
    background: "linear-gradient(180deg, color1 0%, color2 100%)"
  }} />
  {title}
</h2>
```

### Filter Button Pattern
```tsx
<button style={{
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 12,
  border: isActive ? "2px solid color" : "1.5px solid var(--color-border)",
  background: isActive ? colorLight : "var(--color-background)",
  color: isActive ? colorDark : "var(--color-text-muted)",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  transition: "all var(--transition-base)"
}}
onMouseEnter={(e) => {
  if (!isActive) {
    e.currentTarget.style.borderColor = colorDark;
    e.currentTarget.style.color = colorDark;
  }
}}
onMouseLeave={(e) => {
  if (!isActive) {
    e.currentTarget.style.borderColor = "var(--color-border)";
    e.currentTarget.style.color = "var(--color-text-muted)";
  }
}}
>
  <Icon size={16} /> {label}
</button>
```

---

## 🎨 Shadow System

```
var(--shadow-sm): 0 1px 2px rgba(16, 24, 48, 0.06)
  Base shadow for cards and sections

var(--shadow-md): 0 2px 12px rgba(16, 24, 48, 0.10)
  Hover/elevated state

var(--shadow-lg): 0 4px 24px rgba(16, 24, 48, 0.14)
  Modal/overlay (if needed)

var(--shadow-xl): 0 8px 32px rgba(16, 24, 48, 0.18)
  Maximum elevation (rare)

Color-specific shadows:
  0 2px 8px ${color}20
  Used for icon boxes, 20% opacity of icon color
```

---

## ⚡ Transition/Animation System

```
var(--transition-fast): 150ms ease
  Quick feedback (button hover)

var(--transition-base): 250ms ease
  Standard transitions (shadow, color, transform)

var(--transition-slow): 350ms ease
  Slower transitions (page reveals, modals)

Hover animations:
  transform: translateY(-2px to -4px)
  boxShadow: sm → md
  borderColor: color-border → primary/theme
```

---

## 📏 Border System

```
Standard borders:
  1.5px solid var(--color-border)
  Applied to: Cards, sections, inputs, filters

Accent borders (on hover):
  1.5-2px solid themeColor
  Applied to: Active filters, focused inputs

Border radius:
  12px - Input/filter fields
  14px - Icon boxes
  16px - Standard cards, sections
  18px - Large sections
  20px - Headers
```

---

## 🎯 Icon System

```
Icon Sizing by Context:
  Filter buttons: 16px
  Stats/Section icons: 24-26px
  Header decorative icons: 28px
  Icon boxes: 48-56px square

Icon Placement:
  Cards: Top-right or top-left
  Headers: Left of title
  Buttons: Left of label

Icon Colors:
  Primary: var(--color-primary)
  Secondary: var(--color-secondary)
  Success: var(--color-success)
  Error: var(--color-coral)
  Muted: var(--color-text-muted)
```

---

## 📊 Stat Card Variants

### Standard Stat
```
Icon box + large number + label
Used for: Dashboard, Users page
Colors: Varied per card
Hover: Lift + shadow + border color
```

### Staff Account
```
Larger icon (56px) + larger number
Used for: Dashboard only
Color: Purple (#7C3AED)
Special: Dedicated card styling
```

### Section Card
```
Gradient header + icon + content area
Used for: Settings sections
Colors: Primary theme color
Special: Two-part layout
```

---

## 🔄 Responsive Adjustments

```
Desktop (>1200px):
  - All full sizes
  - All decorative elements visible
  - Gradient headers full width

Tablet (768-1200px):
  - Reduce header padding to 32px 28px
  - Reduce stat card padding to 24px
  - Grid columns: 5→3, 4→2
  - Font sizes: -2px

Mobile (<768px):
  - Reduce header padding to 24px 20px
  - Reduce stat card padding to 20px 16px
  - Grid columns: All to 1
  - Font sizes: -4px
  - Icon boxes: 40-44px
  - Section margins: 24px
```

---

## ✨ Premium Finishing Touches

1. **Decorative Circles**
   - Subtle depth without being distracting
   - 40-50% opacity for gentleness
   - Positioned in corners to not interfere
   - Creates modern, sophisticated appearance

2. **Gradient Accents**
   - 5px wide bars beside section titles
   - 135deg angle for consistency
   - Matches page theme color
   - Guides visual hierarchy

3. **Icon Shadows**
   - Color-specific (20% opacity)
   - Enhances icon prominence
   - Subtle but effective
   - Modern/premium feel

4. **Hover Lifts**
   - Small upward movement (-2 to -4px)
   - Paired with shadow upgrade
   - Immediate visual feedback
   - Interactive and responsive

5. **Border Color Transitions**
   - On hover: color-border → theme color
   - Smooth 250ms transition
   - Clear interaction feedback
   - Professional appearance

---

**Last Updated**: April 19, 2026  
**Version**: 1.0 (Production)  
**Ready for**: Implementation and inheritance
