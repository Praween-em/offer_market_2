## CreateOffer Draft State Issue - Root Cause & Solution

### Problem
When navigating: CreateOffer → OfferTypeSelection → OfferItemDetails → back to CreateOffer
- Title gets reset
- Previous items disappear
- Only the latest item shows

### Root Cause
React Navigation's `navigate()` behavior:
- When you call `navigation.navigate('CreateOffer', {newItem})` from OfferItemDetails
- It finds the existing CreateOffer screen in the stack
- **BUT** it may trigger a re-render that resets the useState hooks
- The params are passed, but the local state (title, items) is lost

### Why This Happens
1. **Screen Re-mounting**: Depending on React Navigation's memory management, screens can be unmounted when not visible
2. **State Initialization**: `useState('')` and `useState([])` run again on re-mount
3. **Param Timing**: The `useEffect` that reads `route.params.newItem` fires, but the previous state is gone

### Solution Options

#### Option 1: Use Global State (Redux/Context) ✅ BEST
Store draft data in a global context that persists across navigation

#### Option 2: Use Navigation State ✅ GOOD
Store ALL draft data in navigation params, not just newItem

#### Option 3: Prevent Unmounting ✅ ACCEPTABLE
Use `detachInactiveScreens: false` in navigator options

#### Option 4: Use AsyncStorage ❌ OVERKILL
Persist to storage on every change

### Recommended Fix: Navigation State Pattern
Store the entire draft in navigation params and rebuild state from params on mount
