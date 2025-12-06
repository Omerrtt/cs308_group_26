# Product Backlog

## High Priority Features

### 1. Shopping Cart Functionality (Requirement 1, Requirement 3) - **Not Done**
- Implement shopping cart component with add/remove products and cart persistence for guest users
- Sync cart items with user account upon login and display cart item count in header

### 2. Stock Management System (Requirement 2, Requirement 5) - **Not Done**
- Add stock quantity field to product data model and display availability on product cards
- Prevent adding out-of-stock products to cart and update stock after order completion

### 3. Product Search Functionality (Requirement 5) - **Not Done**
- Implement search bar in header to search products by name and description
- Display search results page with filters

### 4. Product Sorting and Filtering (Requirement 5) - **Not Done**
- Add sorting options: price (low to high, high to low), popularity, newest
- Implement category-based filtering and price range filter

### 5. Order Processing System (Requirement 2) - **Not Done**
- Create order data model in Firebase and implement checkout flow
- Create order status tracking (processing, in-transit, delivered)

### 6. Order History Page (Requirement 2) - **Not Done**
- Display user's order history with order status and allow users to view order details

### 7. Payment Integration (Requirement 3) - **Not Done**
- Integrate mock payment gateway with payment form validation
- Handle payment confirmation and store payment transaction records

### 8. Invoice Generation and Email (Requirement 3) - **Not Done**
- Generate invoice PDF after successful payment and display on screen
- Send invoice PDF via email to user and store invoice records in Firebase

### 9. Product Comments and Ratings System (Requirement 4) - **Not Done**
- Allow users to leave comments and implement 1-5 star rating system
- Add comment approval workflow for product manager and restrict to delivered orders only

### 10. Enhanced Product Properties (Requirement 6) - **Partially Done** (EAN information added, model/serial/warranty/distributor pending)
- Add model number, serial number, warranty status, and distributor information to product data
- Display all product properties on detail page and update product data model in Firebase

## Medium Priority Features

### 12. User Profile Management (Implemented by us - Header profile section) - **Partially Done** (Header profile section with login/logout implemented, full profile page pending)
- Create user profile page with profile editing and address management (shipping/billing)
- Implement password change functionality

## Low Priority Features

### 16. Advanced Search Features (Partially implemented by us - EAN information added) - **Partially Done** (EAN information added to products, search functionality pending)
- Implement search by EAN/barcode/Product ID

### 19. Mobile View - **Partially Done** (Responsive design implemented, further optimization pending)
- Test and fix mobile UI issues

## Technical Debt and Improvements

### 21. Firebase Database Structure Optimization (Requirement 7) - **Partially Done** (Firebase integrated for authentication, database structure optimization pending)
- Review and optimize Firestore data structure with proper indexing for queries
- Add data validation rules and optimize read/write operations

---

**Note:** This backlog includes both implemented features that need enhancement and new features to be developed. Priority levels can be adjusted based on business needs and user feedback.
