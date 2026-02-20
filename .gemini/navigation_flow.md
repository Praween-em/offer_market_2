# Navigation Flow - CreateOffer Campaign

## Current Implementation ✅

### Screen Hierarchy
```
CreateOffer (Screen 1) - Campaign Draft
    ↓ navigate
OfferTypeSelection (Screen 2) - Select offer type
    ↓ navigate  
OfferItemDetails (Screen 3) - Fill item details
```

### Navigation Actions

#### From CreateOffer → OfferTypeSelection
```tsx
// CreateOfferScreen.tsx line ~242
navigation.navigate('OfferTypeSelection')
```
✅ Forward navigation - creates new screen on stack

#### From OfferTypeSelection → Back
```tsx
// OfferTypeSelectionScreen.tsx line 37
navigation.goBack()
```
✅ Goes back to CreateOffer (Screen 1)

#### From OfferTypeSelection → OfferItemDetails
```tsx
// OfferTypeSelectionScreen.tsx line 52
navigation.navigate('OfferItemDetails', { type })
```
✅ Forward navigation - creates new screen on stack

#### From OfferItemDetails → Back (Close button)
```tsx
// OfferItemDetailsScreen.tsx line 454
navigation.pop()
```
✅ Goes back to OfferTypeSelection (Screen 2)

#### From OfferItemDetails → Save & Return to CreateOffer
```tsx
// OfferItemDetailsScreen.tsx line 88
navigation.navigate('CreateOffer', { newItem })
```
⚠️ This navigates to CreateOffer with the new item

## How It Works with Draft Persistence

### Stack State at Each Step

1. **Initial**: `[CreateOffer]`
   - Draft: `{title: "", items: []}`

2. **After clicking "Add Item"**: `[CreateOffer, OfferTypeSelection]`
   - CreateOffer params: `{draftTitle: "Summer Sale", draftItems: []}`

3. **After selecting type**: `[CreateOffer, OfferTypeSelection, OfferItemDetails]`
   - CreateOffer params: `{draftTitle: "Summer Sale", draftItems: []}`

4. **After saving item**: `[CreateOffer]` ← navigates back to CreateOffer
   - CreateOffer params: `{draftTitle: "Summer Sale", draftItems: [item1], newItem: item1}`
   - CreateOffer restores state from params
   - Processes newItem and adds to items array

### Why This Works

1. **CreateOffer persists draft to params** (useEffect on title/items change)
2. **When navigating away**, params are saved
3. **When navigating back**, CreateOffer:
   - Initializes state from params: `useState(route.params?.draftItems || [])`
   - Restores the draft
   - Processes any newItem in params
   - Continues to persist changes

## Navigation Flow Diagram

```
┌─────────────────┐
│  CreateOffer    │ ← Main draft screen (persists to params)
│  [Screen 1]     │
└────────┬────────┘
         │ navigate('OfferTypeSelection')
         ↓
┌─────────────────┐
│OfferTypeSelect  │ ← Selection screen
│  [Screen 2]     │
└────┬──────┬─────┘
     │      │ goBack() → returns to Screen 1
     │      │
     │      └─ Close button (✕)
     │
     │ navigate('OfferItemDetails', {type})
     ↓
┌─────────────────┐
│OfferItemDetails │ ← Form screen
│  [Screen 3]     │
└────┬──────┬─────┘
     │      │
     │      └─ pop() → returns to Screen 2
     │         Close button (✕)
     │
     └─ navigate('CreateOffer', {newItem})
        Save button → returns to Screen 1 with new item
```

## Key Points

✅ **Forward-only navigation**: Screens 2 and 3 only navigate forward or back, never create new instances
✅ **Draft persistence**: CreateOffer saves state to navigation params
✅ **State restoration**: CreateOffer restores state from params on mount
✅ **Item accumulation**: New items are appended, not replaced
✅ **Back button behavior**: Always returns to previous screen in stack

## Testing the Flow

1. Open CreateOffer → Enter title "Test"
2. Click "Add Item" → Navigate to OfferTypeSelection
3. Click ✕ → Goes back to CreateOffer → Title "Test" still there ✅
4. Click "Add Item" → Select "Flat Off" → Navigate to OfferItemDetails
5. Click ✕ → Goes back to OfferTypeSelection ✅
6. Select "Flat Off" again → Fill details → Click "Save"
7. Returns to CreateOffer → Title "Test" + Item 1 visible ✅
8. Click "Add Item" → Select "Percentage" → Fill → Save
9. Returns to CreateOffer → Title "Test" + Item 1 + Item 2 visible ✅
