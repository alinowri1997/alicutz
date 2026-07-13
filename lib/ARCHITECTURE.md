# Ali Cutz Review Platform Architecture

## Overview

The Ali Cutz review platform is a premium, modular system for managing client reviews with media attachments, moderation, and engagement features.

## Database Schema

### Tables

#### `reviews`
Core review entity with user information, rating, and content.
- **id**: UUID (primary key)
- **user_id**: UUID (references auth user)
- **user_name**: Text (reviewer name)
- **user_email**: Email
- **user_avatar_url**: Optional URL
- **rating**: 1-5 stars
- **title**: Review headline (5-200 chars)
- **content**: Review body (20-5000 chars)
- **is_verified**: Boolean (verified reviewer)
- **is_featured**: Boolean (featured on homepage)
- **created_at**, **updated_at**, **deleted_at**: Timestamps (soft deletes)

#### `review_media`
Images and videos attached to reviews.
- **id**: UUID
- **review_id**: FK to reviews
- **media_type**: 'image' | 'video'
- **storage_path**: Supabase Storage path
- **thumbnail_url**: Optional preview
- **file_size**: Bytes
- **width**, **height**: Image dimensions
- **duration_seconds**: Video duration
- **position**: Display order

#### `review_likes`
User reactions to reviews.
- **id**: UUID
- **review_id**: FK to reviews
- **user_id**: User who liked
- **created_at**: Timestamp
- **UNIQUE(review_id, user_id)**: Prevent duplicate likes

#### `review_replies`
Comments and owner responses.
- **id**: UUID
- **review_id**: FK to reviews
- **user_id**: Commenter
- **user_name**, **user_email**, **user_avatar_url**: Comment author info
- **content**: Comment text (5-1000 chars)
- **is_owner_reply**: Boolean (owner's response flag)
- **deleted_at**: Soft delete support

#### `review_flags`
Moderation flags for inappropriate content.
- **id**: UUID
- **review_id**: FK to reviews
- **reason**: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'
- **description**: Optional details
- **reported_by_user_id**: Who reported
- **status**: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
- **moderator_notes**: Mod comments

#### `review_reports`
User awareness reports (separate from moderation flags).
- **id**: UUID
- **review_id**: FK to reviews
- **user_id**: Who reported
- **report_type**: Report category
- **description**: Optional details

### Indexes

Performance indexes on:
- `reviews.rating`, `reviews.is_featured`, `reviews.created_at`, `reviews.user_id`
- `review_media.review_id`
- `review_likes.review_id`, `review_likes.user_id`
- `review_replies.review_id`
- `review_flags.review_id`, `review_flags.status`

## Storage Buckets

### `review-images`
Public bucket for review images (max 10MB).
- Path: `/reviews/{reviewId}/image/{timestamp}-{random}.{ext}`
- Allowed: JPEG, PNG, WebP

### `review-videos`
Public bucket for review videos (max 50MB).
- Path: `/reviews/{reviewId}/video/{timestamp}-{random}.{ext}`
- Allowed: MP4, WebM

## Row Level Security (RLS)

### Public Access
- **reviews**: Authenticated users can read published (non-deleted) reviews
- **review_media**: Public read access for published reviews
- **review_likes**: Public read access

### User-Specific Access
- **reviews**: Users can create, update, soft-delete their own reviews
- **review_media**: Users can manage media on their reviews
- **review_likes**: Users can like/unlike
- **review_replies**: Users can create replies, manage their own
- **review_flags**: Users can report reviews; see their own flags and reports on their reviews

## TypeScript Types

Located in `lib/types/reviews.ts`:

```typescript
// Core types
type ReviewRating = 1 | 2 | 3 | 4 | 5;
type MediaType = 'image' | 'video';
type FlagReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';

// Interfaces
interface Review { ... }
interface ReviewWithRelations { ... }
interface ReviewMedia { ... }
interface ReviewLike { ... }
interface ReviewReply { ... }
interface ReviewFlag { ... }

// Input types
interface CreateReviewInput { ... }
interface UpdateReviewInput { ... }
interface CreateReviewReplyInput { ... }
interface CreateFlagInput { ... }
```

## Validation Schemas

Located in `lib/schemas/reviews.ts` using Zod:

- `createReviewSchema`
- `updateReviewSchema`
- `createReviewReplySchema`
- `createFlagSchema`
- `uploadMediaSchema`
- `filterReviewsSchema`

All include:
- Type validation
- String length constraints
- Email validation
- File type/size limits
- Rating range validation

## API Routes

### Reviews Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/reviews` | List reviews (paginated, filterable) |
| POST | `/api/reviews` | Create new review |
| GET | `/api/reviews/[id]` | Get review details |
| PUT | `/api/reviews/[id]` | Update review |
| DELETE | `/api/reviews/[id]` | Soft-delete review |

### Media Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/reviews/[id]/media` | Upload image/video |
| DELETE | `/api/reviews/[id]/media/[mediaId]` | Delete media |

### Engagement Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/reviews/[id]/likes` | Like review |
| DELETE | `/api/reviews/[id]/likes` | Unlike review |
| POST | `/api/reviews/[id]/replies` | Create reply |
| GET | `/api/reviews/[id]/replies` | Get replies |
| POST | `/api/reviews/[id]/flags` | Flag/report review |

## Server Actions

Located in `app/api/_actions/reviews.ts`:

- `createReview(input)` - Create new review
- `getReview(reviewId)` - Fetch single review with relations
- `getReviews(page, limit)` - List paginated reviews
- `updateReview(reviewId, input)` - Update review
- `deleteReview(reviewId)` - Soft-delete review
- `likeReview(reviewId)` - Add like
- `unlikeReview(reviewId)` - Remove like
- `createReply(reviewId, input)` - Add reply
- `flagReview(reviewId, input)` - Report review

## Utilities

### Upload (`lib/utils/upload.ts`)

```typescript
validateMediaFile(file, mediaType) // Validate before upload
uploadMedia(reviewId, file, mediaType) // Upload and return metadata
deleteMedia(storagePath, mediaType) // Delete from storage
getSignedMediaUrl(storagePath, mediaType) // Get private access URL
```

Handles:
- File type validation (images/videos only)
- Size limits (10MB images, 50MB videos)
- Image dimension extraction
- Video duration calculation

### Supabase Client (`lib/supabase/client.ts`)

```typescript
supabaseBrowser // Client-side operations
supabaseServer() // Server-side with service role
getCurrentUser() // Get auth session
```

## Project Structure

```
alicutz/
├── app/
│   ├── api/
│   │   ├── reviews/
│   │   │   ├── route.ts (GET all, POST create)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts (GET, PUT, DELETE)
│   │   │   │   ├── media/
│   │   │   │   │   └── route.ts (POST upload, DELETE)
│   │   │   │   ├── likes/
│   │   │   │   │   └── route.ts (POST like, DELETE unlike)
│   │   │   │   ├── replies/
│   │   │   │   │   └── route.ts (POST create, GET list)
│   │   │   │   └── flags/
│   │   │   │       └── route.ts (POST flag)
│   │   │   └── _actions/
│   │   │       └── reviews.ts (Server actions)
│   ├── (existing pages)
│   └── layout.tsx
├── lib/
│   ├── db/
│   │   ├── schema.sql (Database schema)
│   │   └── rls-policies.sql (Row Level Security)
│   ├── supabase/
│   │   └── client.ts (Client config)
│   ├── schemas/
│   │   └── reviews.ts (Zod validation)
│   ├── types/
│   │   └── reviews.ts (TypeScript types)
│   └── utils/
│       └── upload.ts (Media handling)
├── .env.example
└── package.json (+ dependencies)
```

## Environment Setup

### 1. Create Supabase Project
- Go to supabase.com
- Create new project
- Copy project URL and keys

### 2. Set Environment Variables
```bash
cp .env.example .env.local
# Fill in with your Supabase credentials
```

### 3. Create Database
```bash
# Run schema.sql in Supabase SQL editor
# Run rls-policies.sql in Supabase SQL editor
```

### 4. Create Storage Buckets
- In Supabase dashboard: Storage > New Bucket
- Create `review-images` (public)
- Create `review-videos` (public)

### 5. Install Dependencies
```bash
npm install
```

## Security Considerations

### RLS Policies
- All tables have RLS enabled
- Users can only modify their own content
- Public read access for published reviews
- Moderation flags require authentication

### File Uploads
- Validated client-side before upload
- MIME type and size checking
- Stored with user/review isolation
- Service role key kept server-side only

### Authentication
- Browser client uses public anon key
- Server operations use service role key
- Session-based user verification

## Performance Features

- **Indexes**: Strategic indexes on sort/filter columns
- **Pagination**: Limit results to 100 max per request
- **Soft deletes**: Preserve data while hiding deleted content
- **Media optimization**: Thumbnail generation planned
- **Caching**: Storage CDN for media delivery

## Next Steps (Not Implemented Today)

1. UI Components (Review list, form, etc.)
2. Moderation dashboard
3. Admin endpoints for flagged reviews
4. Email notifications
5. Thumbnail generation for media
6. Search indexing
7. Review analytics/stats endpoint
8. Bulk operations endpoints

---

Created: 2026-07-13
Platform: Ali Cutz Premium Barber Service
