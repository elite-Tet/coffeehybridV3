# Docs

Everything behind the CoffeeHybrid redesign, in the order it happened.

| | What | Start here |
|---|---|---|
| 1 | **Audit:** what the app looked like and what was broken before any change | [audit/AUDIT.md](audit/AUDIT.md) |
| 2 | **Mockups:** three homepage directions compared side by side; C ("The Board") was chosen | [mockups/index.html](mockups/index.html) |
| 3 | **Screenshots:** the same 13 routes at desktop and phone width, before and after | [screenshots/](screenshots/) |
| 4 | **Onboarding:** how to run it, where things live, how to preview changes | [ONBOARDING.md](ONBOARDING.md) |
| 5 | **Case study:** the story and the numbers, for a portfolio page | [CASE_STUDY.md](CASE_STUDY.md) |

## Folder map

```
docs/
  audit/
    AUDIT.md                    findings, routes, components, dependencies, journeys
    console-and-links.md        raw console errors and link checks per route
  mockups/
    index.html                  open in a browser: the three directions with a width toggle
    a-editorial.html  b-earthy.html  c-motion.html
    screens/                    static captures of each mockup
  screenshots/
    before/                     the March version   (desktop/, mobile/, journey/)
    before-unfinished-redesign/ the uncommitted cream redesign found during the audit
    after/                      this version         (desktop/, mobile/)
    compare/                    side-by-side images used in the README and case study
  ONBOARDING.md
  CASE_STUDY.md
```

Screenshots in `before/` and `after/` share file names (`home.png`, `menu.png`, `order-detail.png`, …), so any pair can be compared directly.
