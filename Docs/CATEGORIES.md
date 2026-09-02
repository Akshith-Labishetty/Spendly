# Categories

Spendly comes with 10 default categories. You can also create custom categories.

## Default Categories

| Category | Color | Icon | Description |
|----------|-------|------|-------------|
| Food | `#F59E0B` (amber) | UtensilsCrossed | Restaurants, cafes, food delivery |
| Q-Commerce | `#14B8A6` (teal) | Zap | Quick commerce: Blinkit, Zepto, Instamart |
| Shopping | `#8B5CF6` (violet) | ShoppingBag | Online shopping, malls, retail |
| Transport | `#3B82F6` (blue) | Car | Cabs, fuel, metro, buses |
| Bills | `#EF4444` (red) | FileText | Electricity, rent, phone, internet |
| Entertainment | `#EC4899` (pink) | Tv | Streaming, movies, subscriptions |
| Health | `#10B981` (green) | Heart | Medical, pharmacy, gym |
| Travel | `#06B6D4` (cyan) | Plane | Flights, hotels, trips |
| Education | `#F97316` (orange) | BookOpen | Courses, books, tuition |
| Other | `#6B7280` (gray) | MoreHorizontal | Uncategorized expenses |

## Auto-Categorization Rules

When importing CSV files, each transaction description is matched against keyword rules. The first matching rule wins.

### Q-Commerce
`blinkit`, `zepto`, `instamart`, `swiggy instamart`, `bigbasket`, `bb daily`, `dmart`, `jiomart`, `rapido stores`, `stry`, `quick commerce`, `10-minute`

### Food
`swiggy`, `zomato`, `dominos`, `mcdonald`, `kfc`, `pizza`, `burger`, `restaurant`, `cafe`, `food`, `dinner`, `lunch`, `breakfast`, `bakery`, `canteen`

### Transport
`uber`, `ola`, `rapido`, `metro`, `bus`, `train`, `auto`, `cab`, `taxi`, `fuel`, `petrol`, `diesel`

### Shopping
`amazon`, `flipkart`, `myntra`, `ajio`, `nykaa`, `meesho`, `shop`, `market`, `mall`, `store`

### Bills
`electricity`, `water`, `internet`, `broadband`, `airtel`, `jio`, `bsnl`, `recharge`, `bill`, `emi`, `rent`

### Entertainment
`netflix`, `spotify`, `prime`, `hotstar`, `youtube premium`, `movie`, `cinema`, `pvr`

### Health
`hospital`, `clinic`, `pharmacy`, `medicine`, `doctor`, `apollo`, `medplus`, `gym`

### Travel
`hotel`, `flight`, `airline`, `indigo`, `spicejet`, `makemytrip`, `goibibo`, `travel`

### Education
`coursera`, `udemy`, `byju`, `school`, `college`, `tuition`, `book`, `course`

## Adding Custom Categories

Use the API to create custom categories:

```bash
POST /api/categories
{
  "name": "Pets",
  "color": "#A855F7",
  "icon": "Dog"
}
```

Custom categories can be deleted. Default categories cannot be deleted.

## File Locations

- Category definitions: `src/lib/categorization.ts`
- Color mappings: `src/lib/utils.ts` (`getCategoryColor()`)
- Category picker UI: `src/components/AddExpenseDialog.tsx`
