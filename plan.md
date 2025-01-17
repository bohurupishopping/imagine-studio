1. Image Generation Page
Objective: Allow users to generate images and save their favorite one for customization.

Current Implementation:
- Main component: app/imagine/page.tsx
- Image generation API: app/api/imagine/route.ts
- Image preview component: components/imagine/ImagePreview.tsx
- Image input component: components/imagine/ImageInputSection.tsx

Page Flow:
1. User enters prompt and clicks generate
2. System validates session and prompt
3. Image is generated via Together API
4. Generated image is displayed in responsive grid
5. User can:
   - View fullscreen preview
   - Delete unwanted images
   - Save preferred image meta data to supabase tabel, and open the Text Customization Popup by clicking Save & Continue, 

Backend Actions:
- Image Generation:
  - Validate user session
  - Call Together API with prompt
  - Return image URL and metadata
- Image Saving:
  - Validate image exists in generated images
  - Save metadata to Supabase designs table
  - Mark image as saved in local state
  - Navigate to customization page

State Management:
- Generated images stored in local state array
- Each image contains:
  - URL
  - Prompt
  - Timestamp
  - Saved status
- Loading state managed for async operations

Error Handling:
- Invalid prompts show toast notification
- Failed API calls show error messages
- Session validation redirects unauthorized users
- Image URL validation before saving

UI/UX Features:
- Animated loading states
- Smooth transitions between states
- Responsive grid layout
- Fullscreen image preview
- Real-time feedback toasts
- Disabled states for saved images

Key Considerations:
- Performance: Lazy loading and image optimization
- Security: Session validation and URL sanitization
- Usability: Clear error states and feedback
- Scalability: Efficient state management
- Accessibility: Keyboard navigation and ARIA labels

**Completed and Tested**

2. Text Customization Popup
When users click “Save & Continue” on the imagine page, open the Text Customization Widget as a modal popup:

Page Flow (with Popup Widget)
User Interface:

Popup Widget Interface
Image Preview Section
Image Display: Show the selected image in the preview section. Seperate, Just for Preview only

Text Preview Section:
Live Text Preview: Dynamically render the text input on the preview. Users can see their updates (font, color, format, ) in real-time.

Input Section
Text Input Fields: Provide up to two input fields, labeled as “Text 1” and “Text 2.”

Each input field has:
A text input box for entering custom text.
A font dropdown (preloaded with local Bengali fonts and web fonts).
A color picker for text color.
Resizing Option (Optional):
Add slider inputs for scaling text size (for finer control).

Buttons
Add Another Text Field: Disabled if the second field is already in use.
Reset Customization: Resets all inputs and clears text previews.

Save & Continue:
Validates user inputs (e.g., ensures at least one text field is filled).
Saves customization data to Supabase design table (update the existing table, because already created during imagine page,).


On "Save & Continue," store text customization data (image ID url, font, text, color, position, etc.) in a Supabase database table.
State Management:

Keep all customization details in local state or session until saved.
Navigation:

On "Save & Continue," navigate to the Order Details Page.
Key Considerations:
Simplicity: Avoid image modifications; focus solely on text.
Fonts: Preload local fonts for smooth rendering.
Error Handling: Ensure fonts and colors are correctly mapped to the preview.
**Completed and Tested**

3. Order Details Page
Objective: Showcase all saved data for the user from the database table on this page, then Validate WooCommerce orders and store all order & design-related data for the order on a new supabase database table "order".
 

Page Flow:
User Interface:
Display on a table (card) we'll showcase design details from supabase that just saved in the previous page (app\imagine\page.tsx), 
Display an input field for the order ID & mail id optional,  
Once entered and Fetch Button, show fetched order details (e.g., order status, items, total cost). 
 
Provide a "Place Order" button for save the all the design table data (learn table sql :sql\designs.sql) and order data to the new table called "order", and redirect user to the confirmation page, 


Backend Actions:
1. Fetch "design" details from the supabase db table for the user id, 
2. Fetch order details from the WooCommerce REST API:
3. Validate the order ID and ensure the payment status is completed/paid.

Combine data:
Image URL (from Supabase Storage).
Text customization details (from Supabase database).
Order details (from WooCommerce).
Store the combined data in a new Supabase database table.
State Management:

Maintain the fetched order details in local state until saved.
Navigation:

On "Place Order," display a success message or navigate to a confirmation page.
Key Considerations:
Order Validation: Only allow paid orders to proceed.
Error Handling: Handle invalid order IDs or API failures gracefully.
Data Integrity: Ensure all combined data (image, text, order) is stored correctly.


4. Order Placement Page
Objective: Finalize the order and confirm placement.

Page Flow:
User Interface:

Display a summary of:
The T-shirt design preview (image + text).
Order details (e.g., order ID, quantity, price).
Backend Actions:

Call the WooCommerce API to place the order if not already placed.
Confirm the order status and display the success page.
State Management:

Track order placement status and confirmation details.
Navigation:

Redirect users to a Thank You/Confirmation Page after successful order placement.
Key Considerations:
Confirmation: Show a detailed confirmation page for user reassurance.
Data Synchronization: Sync all finalized data with your Supabase database for analytics or future use.
5. Confirmation Page
Objective: Provide a final confirmation and order summary to the user.

Page Flow:
User Interface:

Display the confirmed order details:
Order ID.
T-shirt design preview.
Total cost.
Delivery timeline (optional).
Backend Actions:

No additional backend actions; all data should already be saved.
Navigation:

Provide navigation options to return to the homepage or start a new order.
Key Considerations:
Retention: Include a "Share" option to encourage users to share their design on social media.
Final Notes
Iterative Development: Build and test each page independently to ensure smooth transitions and data flow.
Performance: Optimize API calls and Supabase queries for speed and reliability.
Scalability: Design the database schema to handle large volumes of users and data efficiently.
Let me know if you'd like to dive deeper into any specific page or functionality!
