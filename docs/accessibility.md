# Accessibility audit

**Date:** October 2026
**Target:** WCAG 2.2, Level AA
**Environment:** Windows, Chrome and Firefox, NVDA 2026.3 (2023.3.0.58174)

## Scope

Every screen and dialog: home, How it works, create a room, enter a room, waiting room, game, the leave dialog, match, and not found.

## Methods

| Method                                    | What it checks                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Lighthouse (accessibility, snapshot mode) | Automated checks on each screen in its live state                                       |
| Keyboard only                             | Visible focus, logical order, full operability, no traps, Escape closes dialogs         |
| NVDA screen reader                        | Announcements on screen changes, control names, live status messages, heading structure |
| Zoom at 200% and 400%                     | Reflow without loss of content or sideways scrolling (WCAG 1.4.10)                      |
| Reduced motion (emulated)                 | No movement when the user has asked for less                                            |
| Forced colours (emulated)                 | Usability under Windows contrast themes                                                 |

Automated tools detect only part of accessibility problems, so manual checks carry most of the weight.

## Results

| Check          | Result                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse     | All applicable audits pass on every screen                                                                                          |
| Keyboard only  | Pass: focus always visible, order logical, every action available, no traps, Escape closes both dialogs                             |
| Screen reader  | Pass: screen changes announce the new heading, controls have clear names, status messages are announced, nothing decorative is read |
| Zoom           | Pass after fix (see below)                                                                                                          |
| Reduced motion | Pass: no movement anywhere                                                                                                          |
| Forced colours | Pass: borders and text remain, states are distinguishable, status dots are backed by text                                           |

## Issues found and fixed during the audit

- **Focus was lost after a screen change.** In a single-page app, the focused button disappears when the screen changes and focus falls to the page body, so screen reader users heard nothing. Focus now moves to the new screen's heading, unless the screen has already placed focus deliberately, such as the name field on Create and Join.
- **The game screen's poster disappeared at high zoom.** The single-screen layout squeezed the poster to nothing at 400%. Below 640px of height, the game screen now scrolls vertically with a fixed-size poster. Phones held sideways benefit too.

## Issues fixed earlier in development

- Faded text directly on the teal background failed contrast; it now renders at full strength.
- Cream text on pink buttons failed contrast (about 3.2:1); buttons now use black text (about 6.5:1).
- Partner connection status was planned as colour alone; it's shown in words as well (WCAG 1.4.1).
- Pending buttons used `disabled`, which removed keyboard focus; they use `aria-disabled` and stay focusable.
- Animations respect reduced motion, and the match background is static rather than continuously moving (WCAG 2.2.2).

## Known limitations

- Status messages caused by the _other_ player, such as a partner joining, still need verifying with a screen reader on a second device.
- Shortcut tooltips use the `title` attribute, which doesn't appear on keyboard focus or touch. The shortcuts are also exposed through `aria-keyshortcuts` and described in How it works.
- Emulated reduced motion and forced colours are close to, but not identical to, the real operating system settings.
- Automated component tests run in jsdom, which has no layout or CSS, so visual accessibility relies on the manual checks above.
