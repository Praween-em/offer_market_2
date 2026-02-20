# Navigation Reference - Owner App

## Navigation Structure

```
MainStack
├── Main (TabNavigator)
│   ├── Dashboard
│   ├── Offers
│   ├── Analytics
│   └── Profile
├── CreateOffer
├── ManageOffers
├── AnalyticsDetails
├── OfferView
├── OfferTypeSelection
├── OfferItemDetails
├── PrivacyPolicy
├── Terms
├── Settings
├── EditProfile
└── BranchAddress
```

## How to Navigate to Dashboard

### From any screen in the app:
```tsx
navigation.navigate('Main', { screen: 'Dashboard' })
```

### From a screen already inside Main (tabs):
```tsx
navigation.navigate('Dashboard')
```

## Navigation Examples

### Go to Dashboard
```tsx
navigation.navigate('Main', { screen: 'Dashboard' })
```

### Go to Profile Tab
```tsx
navigation.navigate('Main', { screen: 'Profile' })
```

### Go to Offers Tab
```tsx
navigation.navigate('Main', { screen: 'Offers' })
```

### Go to Analytics Tab
```tsx
navigation.navigate('Main', { screen: 'Analytics' })
```

### Go to CreateOffer
```tsx
navigation.navigate('CreateOffer')
```

### Go Back to Previous Screen
```tsx
navigation.goBack()
```

### Pop to Top of Stack (Go to Dashboard)
```tsx
navigation.popToTop()
// Then navigate to Dashboard tab
navigation.navigate('Main', { screen: 'Dashboard' })
```

## Current Screen Navigation Patterns

### CreateOfferScreen
- **Close button** → Navigate to Dashboard
```tsx
navigation.navigate('Main', { screen: 'Dashboard' })
```

### OfferTypeSelectionScreen
- **Close button (✕)** → Go back to CreateOffer
```tsx
navigation.goBack()
```

### OfferItemDetailsScreen
- **Close button (✕)** → Go back to CreateOffer
```tsx
navigation.navigate('CreateOffer')
```
- **Save button** → Go back to CreateOffer with new item
```tsx
navigation.navigate('CreateOffer', { newItem })
```

## Navigation Flow for Offer Creation

```
Dashboard
  ↓ Click "Create Offer"
CreateOffer (Screen 1)
  ↓ Click "Add Item"
OfferTypeSelection (Screen 2)
  ↓ Select offer type
OfferItemDetails (Screen 3)
  ↓ Click "Save"
CreateOffer (Screen 1) ← with new item added
  ↓ Click "Publish"
Dashboard ← Success!
```

## Important Notes

1. **Nested Navigation**: Dashboard is inside `Main` (TabNavigator), so you need to use nested navigation syntax
2. **Draft Persistence**: CreateOffer saves draft to navigation params, so navigating back preserves state
3. **Forward Flow**: Offer creation flows forward only (CreateOffer → TypeSelection → ItemDetails → back to CreateOffer)
4. **Close Buttons**: All close buttons (✕) should navigate back to their parent screen or Dashboard
