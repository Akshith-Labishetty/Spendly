# CSV Import Guide

## How It Works

1. Upload a CSV file via drag-and-drop or file picker
2. The parser auto-detects column names and extracts transactions
3. Each transaction is auto-categorized using keyword matching
4. Duplicate detection flags possible matches against existing expenses
5. You review and deselect any transactions you don't want
6. Confirm to bulk-import into your account

## Supported CSV Formats

The parser auto-detects columns by name. Your CSV needs these three columns (any name variation works):

### Date column
Recognized names: `date`, `transaction date`, `txn date`, `value date`, `posting date`, `trans date`, `dated`

### Description column
Recognized names: `description`, `narration`, `remarks`, `particulars`, `details`, `transaction details`, `transaction description`, `reference`, `txn description`

### Amount column
Recognized names: `debit`, `withdrawal`, `amount`, `dr amount`, `debit amount`, `withdrawal amount`, `transaction amount`, `txn amount`

### Example CSV

```csv
Date,Description,Debit
01/08/2026,Swiggy Food Order,450
02/08/2026,Uber Ride to Office,320
03/08/2026,Amazon Shopping,1299
```

## Date Formats

These date formats are automatically parsed:

| Format | Example |
|--------|---------|
| dd/MM/yyyy | 01/08/2026 |
| MM/dd/yyyy | 08/01/2026 |
| yyyy-MM-dd | 2026-08-01 |
| dd-MM-yyyy | 01-08-2026 |
| dd MMM yyyy | 01 Aug 2026 |
| MMM dd yyyy | Aug 01 2026 |
| d/M/yyyy | 1/8/2026 |

## Auto-Categorization

Transactions are categorized by keyword matching in the description. Keywords are case-insensitive.

| Category | Keywords |
|----------|----------|
| Q-Commerce | blinkit, zepto, instamart, bigbasket, dmart, jiomart |
| Food | swiggy, zomato, dominos, restaurant, cafe, lunch, dinner |
| Transport | uber, ola, metro, bus, petrol, cab, fuel |
| Shopping | amazon, flipkart, myntra, mall, store |
| Bills | electricity, rent, recharge, internet, airtel, jio |
| Entertainment | netflix, spotify, movie, pvr, cinema |
| Health | hospital, pharmacy, medicine, doctor |
| Travel | hotel, flight, indigo, makemytrip |
| Education | coursera, udemy, school, college |
| Other | Fallback for unmatched descriptions |

## Duplicate Detection

Before showing the preview, the system checks each transaction against your existing expenses. A transaction is flagged as a **possible duplicate** if it matches on all three:
- Same day (within 24 hours)
- Same amount (within 0.01)
- Similar description (first 8 characters match)

## File Limits

- Maximum file size: **5MB**
- Supported format: **.csv only**
