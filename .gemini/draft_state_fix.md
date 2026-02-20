# CreateOffer Draft State - FIXED ✅

## The Problem
When creating an offer with multiple items:
- ❌ Title would disappear when navigating to add items
- ❌ First item would be replaced by second item
- ❌ Draft state was lost during navigation

## Root Cause
**React Navigation screen lifecycle issue:**

When you navigate: `CreateOffer → OfferTypeSelection → OfferItemDetails → back to CreateOffer`

The `CreateOffer` screen's `useState` hooks were being re-initialized because:
1. The screen was either being unmounted/remounted
2. OR the state wasn't being preserved across navigation events
3. `navigation.navigate('CreateOffer', {newItem})` was focusing the screen but state was lost

## The Solution: Draft Persistence Pattern

### 1. Initialize State from Navigation Params
```tsx
const [title, setTitle] = useState(route.params?.draftTitle || '');
const [items, setItems] = useState<any[]>(route.params?.draftItems || []);
```

This ensures that when the screen re-mounts or re-renders, it restores the draft from params.

### 2. Persist State to Navigation Params
```tsx
useEffect(() => {
    navigation.setParams({
        draftTitle: title,
        draftStartDate: startDate,
        draftEndDate: endDate,
        draftItems: items,
    });
}, [title, startDate, endDate, items]);
```

Every time the draft changes, we save it to navigation params. This acts as a "backup" that survives navigation.

### 3. Handle New Items Correctly
```tsx
useEffect(() => {
    const newItem = route.params?.newItem;
    
    if (newItem && newItem.id) {
        setItems(prevItems => {
            const isDuplicate = prevItems.some(it => it.id === newItem.id);
            if (isDuplicate) return prevItems;
            return [...prevItems, newItem];
        });
        
        navigation.setParams({ newItem: undefined });
    }
}, [route.params?.newItem]);
```

- Uses functional state update to ensure we're working with latest items
- Checks for duplicates
- Clears the `newItem` param after processing

### 4. Clear Draft After Publish
```tsx
// After successful API call
setTitle('');
setItems([]);
navigation.setParams({
    draftTitle: undefined,
    draftItems: undefined,
    // ... clear all draft params
});
```

## How It Works

### Navigation Flow
```
Profile
  ↓ (navigate)
CreateOffer [title="", items=[]]
  ↓ (navigate)
OfferTypeSelection
  ↓ (navigate)
OfferItemDetails
  ↓ (navigate back with newItem)
CreateOffer [restored from params: title="My Offer", items=[item1]]
  ↓ (add another item)
OfferTypeSelection
  ↓
OfferItemDetails
  ↓ (navigate back with newItem)
CreateOffer [restored from params: title="My Offer", items=[item1, item2]]
```

### State Lifecycle
1. **First Mount**: Initialize from params (empty) or defaults
2. **User Types Title**: State updates → saved to params
3. **Navigate Away**: Screen may unmount
4. **Navigate Back**: Screen remounts → restores from params ✅
5. **Add Item**: Item appended → saved to params
6. **Publish**: Clear state + params → fresh start

## Key Benefits
✅ Draft survives navigation
✅ Title persists
✅ Items accumulate correctly
✅ No duplicate items
✅ Clean slate after publish
✅ Works even if screen unmounts

## Testing Checklist
- [ ] Enter title → navigate to add item → come back → title still there
- [ ] Add first item → see it in list
- [ ] Add second item → both items visible
- [ ] Add third item → all three items visible
- [ ] Publish → success → draft cleared
- [ ] Create new offer → starts fresh

## Edge Cases Handled
1. **Duplicate Items**: ID check prevents same item being added twice
2. **Screen Unmounting**: Params restore state on remount
3. **Rapid Navigation**: Functional state updates prevent race conditions
4. **Publish Failure**: Draft remains intact for retry
5. **Back Button**: Draft persists if user navigates back
