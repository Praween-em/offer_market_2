# 2026 DPDP Compliance Notices

## English Version

### Contact Reveal Notice
```
DATA PROTECTION NOTICE

Your contact information will be shared with the service provider after viewing a brief advertisement. This is done with your explicit consent under Section 6 of the Digital Personal Data Protection Act, 2023.

You may withdraw consent at any time by deleting your service request. A maximum of 3 service providers can access your contact details per request.

For grievances, contact: dpo@ofera.in
Data Protection Board: https://dpb.gov.in
```

### Nominee Section Notice
```
NOMINATION RIGHT (Section 10)

Under the Digital Personal Data Protection Act, 2023, you have the right to nominate a person to manage your data in case of death or incapacity.

Your nominee will be able to:
- Access your service requests
- Manage your account data
- Exercise your data rights on your behalf

This is optional but recommended for data continuity.
```

### Aadhaar Verification Notice
```
AADHAAR VERIFICATION NOTICE

Your Aadhaar details are securely stored in an encrypted vault. We do NOT store your 12-digit Aadhaar number.

What we store:
✓ Reference Token (UID Token)
✓ Masked Aadhaar (XXXX-XXXX-1234)
✓ Encrypted e-KYC XML

Your Aadhaar data is protected with HSM-grade encryption and all access is logged for audit purposes.
```

---

## Hindi Version (हिंदी)

### संपर्क प्रकटीकरण सूचना
```
डेटा सुरक्षा सूचना

एक संक्षिप्त विज्ञापन देखने के बाद आपकी संपर्क जानकारी सेवा प्रदाता के साथ साझा की जाएगी। यह डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 की धारा 6 के तहत आपकी स्पष्ट सहमति से किया जाता है।

आप किसी भी समय अपना सेवा अनुरोध हटाकर सहमति वापस ले सकते हैं। प्रति अनुरोध अधिकतम 3 सेवा प्रदाता आपके संपर्क विवरण तक पहुंच सकते हैं।

शिकायतों के लिए संपर्क करें: dpo@ofera.in
डेटा संरक्षण बोर्ड: https://dpb.gov.in
```

### नामांकन अधिकार सूचना
```
नामांकन अधिकार (धारा 10)

डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत, आपको मृत्यु या अक्षमता की स्थिति में अपने डेटा को प्रबंधित करने के लिए किसी व्यक्ति को नामांकित करने का अधिकार है।

आपका नामांकित व्यक्ति सक्षम होगा:
- आपके सेवा अनुरोधों तक पहुंचने में
- आपके खाते के डेटा को प्रबंधित करने में
- आपकी ओर से आपके डेटा अधिकारों का प्रयोग करने में

यह वैकल्पिक है लेकिन डेटा निरंतरता के लिए अनुशंसित है।
```

### आधार सत्यापन सूचना
```
आधार सत्यापन सूचना

आपके आधार विवरण सुरक्षित रूप से एक एन्क्रिप्टेड वॉल्ट में संग्रहीत हैं। हम आपका 12-अंकीय आधार नंबर संग्रहीत नहीं करते हैं।

हम क्या संग्रहीत करते हैं:
✓ संदर्भ टोकन (UID टोकन)
✓ मास्क किया हुआ आधार (XXXX-XXXX-1234)
✓ एन्क्रिप्टेड ई-केवाईसी XML

आपका आधार डेटा HSM-ग्रेड एन्क्रिप्शन से सुरक्षित है और सभी पहुंच ऑडिट उद्देश्यों के लिए लॉग की जाती है।
```

---

## Usage in Code

### React Native
```typescript
import { COMPLIANCE_NOTICES } from './compliance-notices';

// English
Alert.alert('Data Protection Notice', COMPLIANCE_NOTICES.EN.CONTACT_REVEAL);

// Hindi
Alert.alert('डेटा सुरक्षा सूचना', COMPLIANCE_NOTICES.HI.CONTACT_REVEAL);
```

### Export Constants
```typescript
export const COMPLIANCE_NOTICES = {
    EN: {
        CONTACT_REVEAL: `DATA PROTECTION NOTICE\n\nYour contact information will be shared...`,
        NOMINEE_SECTION: `NOMINATION RIGHT (Section 10)\n\nUnder the Digital Personal Data...`,
        AADHAAR_VERIFICATION: `AADHAAR VERIFICATION NOTICE\n\nYour Aadhaar details are securely...`,
    },
    HI: {
        CONTACT_REVEAL: `डेटा सुरक्षा सूचना\n\nएक संक्षिप्त विज्ञापन देखने के बाद...`,
        NOMINEE_SECTION: `नामांकन अधिकार (धारा 10)\n\nडिजिटल व्यक्तिगत डेटा संरक्षण...`,
        AADHAAR_VERIFICATION: `आधार सत्यापन सूचना\n\nआपके आधार विवरण सुरक्षित रूप से...`,
    },
};
```

---

## Legal Requirements

1. **Language**: Must be provided in English and Hindi (as per DPDP Act)
2. **Placement**: Must be shown BEFORE data collection/sharing
3. **Consent**: Must obtain explicit consent (checkbox/button)
4. **Withdrawal**: Must provide clear mechanism to withdraw consent
5. **Contact**: Must provide DPO contact and DPB link

---

## Compliance Checklist

- [x] English version created
- [x] Hindi version created
- [x] Contact reveal notice
- [x] Nominee section notice
- [x] Aadhaar verification notice
- [x] DPO contact included
- [x] DPB link included
- [ ] Legal review pending
- [ ] Translation verification pending
