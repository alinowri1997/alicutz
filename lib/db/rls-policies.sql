-- Row Level Security Policies for Reviews Platform

-- Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- =====================
-- REVIEWS TABLE POLICIES
-- =====================

-- Anyone can read published reviews (not deleted)
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (deleted_at IS NULL);

-- Users can insert their own reviews
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (not deleted)
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can soft-delete their own reviews
CREATE POLICY "reviews_delete_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- REVIEW_MEDIA TABLE POLICIES
-- =====================

-- Anyone can read media for published reviews
CREATE POLICY "review_media_select_public" ON review_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_media.review_id
      AND r.deleted_at IS NULL
    )
  );

-- Users can insert media for their own reviews
CREATE POLICY "review_media_insert_own" ON review_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_media.review_id
      AND r.user_id = auth.uid()
      AND r.deleted_at IS NULL
    )
  );

-- Users can delete media from their own reviews
CREATE POLICY "review_media_delete_own" ON review_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_media.review_id
      AND r.user_id = auth.uid()
    )
  );

-- =====================
-- REVIEW_LIKES TABLE POLICIES
-- =====================

-- Anyone can read likes
CREATE POLICY "review_likes_select_public" ON review_likes
  FOR SELECT USING (true);

-- Authenticated users can like reviews
CREATE POLICY "review_likes_insert_auth" ON review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "review_likes_delete_own" ON review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- REVIEW_REPLIES TABLE POLICIES
-- =====================

-- Anyone can read replies on published reviews
CREATE POLICY "review_replies_select_public" ON review_replies
  FOR SELECT USING (
    deleted_at IS NULL AND EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_replies.review_id
      AND r.deleted_at IS NULL
    )
  );

-- Authenticated users can create replies
CREATE POLICY "review_replies_insert_auth" ON review_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own replies
CREATE POLICY "review_replies_update_own" ON review_replies
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can soft-delete their own replies
CREATE POLICY "review_replies_delete_own" ON review_replies
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- REVIEW_FLAGS TABLE POLICIES
-- =====================

-- Only authenticated users can view flags on their own reviews or their own flags
CREATE POLICY "review_flags_select_own_or_review_owner" ON review_flags
  FOR SELECT USING (
    auth.uid() = reported_by_user_id OR
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_flags.review_id
      AND r.user_id = auth.uid()
    )
  );

-- Authenticated users can report reviews
CREATE POLICY "review_flags_insert_auth" ON review_flags
  FOR INSERT WITH CHECK (auth.uid() = reported_by_user_id);

-- =====================
-- REVIEW_REPORTS TABLE POLICIES
-- =====================

-- Users can only see their own reports
CREATE POLICY "review_reports_select_own" ON review_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reports
CREATE POLICY "review_reports_insert_auth" ON review_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
