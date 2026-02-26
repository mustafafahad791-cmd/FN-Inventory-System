# 🚀 Phase 4: Entry Templates - Kickoff

**Date**: February 26, 2026  
**Branch**: `phase-4-entry-templates`  
**Status**: 🟢 READY TO START  
**Estimated Duration**: 1-2 days  

---

## 📋 Feature Overview

**Feature #4: Entry Templates** - Product variants & SKU management  

Entry Templates are the **bridge** between:
- Items (master products)
- Inventory (stock tracking)
- Receipts (sales records)
- Transfers (inter-branch moves)

### Why Entry Templates Matter
- **Templates are variants** - A chair can have Leather/Fabric, Small/Large, Red/Blue
- **Inventory is tracked by template** - Not just "chairs", but "leather-chair-large-red"
- **Receipts use templates** - You sell specific variants
- **Required for multi-location** - Different branches have different template stock levels

---

## 🎯 Feature Requirements

### What Gets Built

#### Database (Already Ready)
- [ ] **EntryTemplate table** - Already exists, verify all fields
  - `id` (UUID, Primary Key)
  - `item_id` (UUID, Foreign Key → items)
  - `template_name` (VARCHAR 255) - e.g., "Leather - Large - Red"
  - `specifications` (JSONB) - e.g., {"material": "leather", "size": "large", "color": "red"}
  - `unit_price` (NUMERIC(10,2))
  - `sku` (VARCHAR 50, UNIQUE) - e.g., "CHAIR-LEATHER-L-RED"
  - `is_active` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

#### Backend (Node.js)

**EntryTemplateController.js** - CONVERT TO FUNCTIONAL EXPORTS (7 methods)
- `createTemplate()` - Add new template variant
  - Validate item exists
  - Validate unique SKU
  - Validate specifications structure
  - Set initial unit_price
  - Return created template
  
- `getAllTemplates()` - List all active templates
  - Support pagination (limit/offset)
  - Include item details
  - Filter by is_active
  - Return count metadata
  
- `getTemplateById()` - Get single template details
  - Include full item information
  - Include specification details
  - Include usage statistics (inventory qty, receipt count)
  
- `updateTemplate()` - Edit template information
  - Can update: template_name, specifications, unit_price, sku
  - Validate updated SKU uniqueness (exclude self)
  - Prevent changing item_id
  - Update timestamp
  
- `searchTemplates()` - Search templates
  - Search by template_name
  - Search by SKU
  - Filter by item_id
  - Support full-text search
  
- `deactivateTemplate()` - Soft delete template
  - Set is_active = false
  - Prevent selling deactivated templates
  - Keep historical records
  
- `getTemplateStats()` - Template usage analytics
  - Count templates per item
  - Total revenue from template
  - Average unit price
  - Usage frequency

**entry-templates.js routes** - 7 RESTful endpoints
- `POST /api/entry-templates` - Create template
- `GET /api/entry-templates` - List templates with pagination
- `GET /api/entry-templates/search?q=&item_id=` - Search templates
- `GET /api/entry-templates/:id` - Get template details
- `PUT /api/entry-templates/:id` - Update template
- `DELETE /api/entry-templates/:id` - Deactivate template
- `GET /api/entry-templates/:id/stats` - Get statistics
- All routes require JWT authentication

#### Frontend (React)

**EntryTemplateListPage.js** - Main template management page
- Display all active templates with item information
- Real-time search by template name/SKU
- Filter by associated Item
- Statistics dashboard
- Create/Edit/Delete operations
- Empty state handling
- Responsive card/grid view
- Pagination support

**EntryTemplateForm.js** - Create/Edit modal component
- Template Name field (required, auto-generate from specs)
- Item selector dropdown (required)
- Specifications builder
  - Dynamic spec input fields
  - Add/Remove spec buttons
  - Common specs: Material, Size, Color, Pattern
- SKU field (auto-generated from item SKU + specs)
- Unit Price field (required, numeric)
- Validation error display
- Success/error handling
- Pre-filled data for edit mode

**EntryTemplateManagement.css** - Styling
- Card layouts with grid view
- Modal styling for form
- Responsive breakpoints (desktop/tablet/mobile)
- Error/success states
- Loading animations
- Spec builder styling

**App.js Integration**
- Add route: `/entry-templates` → EntryTemplateListPage
- Protected route (requires authentication)

**DashboardPage.js Integration**
- Add "Entry Templates" link
- Show template count statistics
- Link to manage templates

**api.js Services** - API methods
- `getTemplates(page)`
- `getTemplateById(id)`
- `createTemplate(data)`
- `updateTemplate(id, data)`
- `deactivateTemplate(id)`
- `searchTemplates(query, itemId)`
- `getTemplateStats(id)`

---

## ✅ Success Criteria

### Backend Requirements
- [ ] EntryTemplateController.js converted to functional exports (7 methods)
- [ ] All 7 routes created with JWT middleware
- [ ] Database queries use prepared statements
- [ ] Error codes system (MISSING_FIELDS, DUPLICATE_SKU, TEMPLATE_NOT_FOUND, etc.)
- [ ] Input validation on all endpoints
- [ ] Soft delete working correctly
- [ ] Pagination implemented (default 20 items)
- [ ] Search/filter working across name, SKU, item_id

### Frontend Requirements
- [ ] EntryTemplateListPage displays templates with item names
- [ ] Real-time search and filtering working
- [ ] Create button opens EntryTemplateForm modal
- [ ] Edit button pre-fills form with template data
- [ ] Delete/Deactivate with confirmation dialog
- [ ] Pagination working correctly
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Error messages displayed to user
- [ ] Loading states shown during operations
- [ ] Auto-generate SKU from item SKU + specs

### Testing Requirements
- [ ] Backend: npm start on port 5000 - success
- [ ] Frontend: npm start on port 3000 - success
- [ ] Manual UI testing: Create, Read, Update, Delete operations
- [ ] API testing: All 7 endpoints working with valid/invalid inputs
- [ ] Error scenarios: Duplicate SKU, missing fields, invalid item_id
- [ ] Pagination: Load >20 templates, verify pagination works

### Git Requirements
- [ ] Branch created: `phase-4-entry-templates`
- [ ] All changes committed with clear messages
- [ ] Ready to push to remote

---

## 📊 Implementation Plan

### Step 1: Backend Conversion (2-3 hours)
1. Convert EntryTemplateController.js to functional exports (7 methods)
2. Update entry-templates.js routes with all 7 endpoints
3. Add JWT authentication middleware
4. Implement error codes and validation
5. Test all endpoints with curl/Postman

### Step 2: Frontend Components (3-4 hours)
1. Create EntryTemplateListPage.js
2. Create EntryTemplateForm.js with spec builder
3. Create EntryTemplateManagement.css
4. Update App.js routes
5. Update DashboardPage.js

### Step 3: Integration & Styling (2-3 hours)
1. Add api.js service methods
2. Complete responsive CSS
3. Add loading/error states
4. Manual UI testing

### Step 4: Final Testing & Deployment (2-3 hours)
1. Full CRUD testing through UI
2. Error scenario testing
3. Pagination verification
4. Git commits and push to remote

---

## 🔗 Dependencies

✅ **Item Management (Phase 3)** - COMPLETE
- Templates require items to exist
- Need to select item in template creation

**Inventory Management (Phase 5)** - Depends on this
- Will track inventory by template
- Will create receipts for templates

---

## 📚 Related Documentation

- [Phase 3 Item Management Complete](PHASE3_ITEM_MANAGEMENT_COMPLETE.md)
- [Phase 2 Ranked Roadmap](PHASE2_RANKED_ROADMAP.md)
- [Authentication Implementation](AUTHENTICATION_IMPLEMENTATION.md)
- [Database Schema](../database/schema.sql)

---

## 🎯 Commits Expected

1. **Commit 1**: Backend - EntryTemplateController & routes
   - Message: "Feature: Phase 4 Entry Templates - Backend EntryTemplateController (7 methods) + routes with JWT auth"

2. **Commit 2**: Frontend - Components & Styling
   - Message: "Feature: Phase 4 Entry Templates - Frontend components (list, form, CSS) with full CRUD"

3. **Commit 3**: Documentation
   - Message: "Docs: Phase 4 Entry Templates - Complete implementation documentation"

---

**Status**: Ready to implement 🚀
