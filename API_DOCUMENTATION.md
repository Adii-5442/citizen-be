# Citizen API Documentation

## Base URL
```
http://localhost:2000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## User Endpoints

### Register User
```
POST /users/register
```
**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Login User
```
POST /users/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Check Username Availability
```
GET /users/check-username?username=string
```

### Get User Profile
```
GET /users/profile/:id
```

### Update User Profile
```
PATCH /users/profile/:id
```

### Get Current User
```
GET /users/me
```

### Update Current User
```
PATCH /users/me
```

---

## Rant Endpoints

### Create Rant
```
POST /rants
```
**Body:**
```json
{
  "text": "string (required)",
  "title": "string (optional)",
  "imageUrl": "string (optional)",
  "images": [
    {
      "url": "string",
      "caption": "string",
      "order": "number"
    }
  ],
  "location": {
    "city": "string (required)",
    "state": "string",
    "country": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    },
    "address": "string",
    "postalCode": "string"
  },
  "category": "infrastructure|transportation|environment|safety|healthcare|education|noise|parking|maintenance|utilities|parks|traffic|pollution|other",
  "priority": "low|medium|high|urgent",
  "tags": ["string"],
  "mentions": ["userId"],
  "isAnonymous": "boolean",
  "attachments": [
    {
      "type": "image|video|document|audio",
      "url": "string",
      "filename": "string",
      "size": "number",
      "mimeType": "string"
    }
  ]
}
```

### Get Rants
```
GET /rants?sort=recent|trending|hot|most_liked|most_commented|priority&city=string&category=string&status=string&priority=string&page=number&limit=number&search=string&tags=string&author=string
```

### Get Trending Rants
```
GET /rants/trending?city=string&limit=number
```

### Get Hot Rants
```
GET /rants/hot?city=string&limit=number
```

### Get Rant by ID
```
GET /rants/:id
```

### Update Rant
```
PATCH /rants/:id
```

### Delete Rant
```
DELETE /rants/:id
```

### Like Rant
```
POST /rants/:id/like
```

### Dislike Rant
```
POST /rants/:id/dislike
```

### Bookmark Rant
```
POST /rants/:id/bookmark
```

### Share Rant
```
POST /rants/:id/share
```

### Report Rant
```
POST /rants/:id/report
```
**Body:**
```json
{
  "reason": "spam|inappropriate|harassment|false_information|other"
}
```

### Get Rant Comments
```
GET /rants/:id/comments?page=number&limit=number&sort=recent|most_liked|most_replied
```

---

## Comment Endpoints

### Create Comment
```
POST /comments/:rantId
```
**Body:**
```json
{
  "text": "string (required)",
  "parentComment": "commentId (optional, for replies)",
  "tags": ["string"],
  "mentions": ["userId"],
  "isAnonymous": "boolean",
  "attachments": [
    {
      "type": "image|video|document",
      "url": "string",
      "filename": "string",
      "size": "number"
    }
  ],
  "location": {
    "city": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    }
  }
}
```

### Get Comments
```
GET /comments?rantId=string&parentComment=string&page=number&limit=number&sort=recent|most_liked|most_replied|oldest
```

### Get Comment by ID
```
GET /comments/:id
```

### Update Comment
```
PATCH /comments/:id
```

### Delete Comment
```
DELETE /comments/:id
```

### Like Comment
```
POST /comments/:id/like
```

### Dislike Comment
```
POST /comments/:id/dislike
```

### Report Comment
```
POST /comments/:id/report
```
**Body:**
```json
{
  "reason": "spam|inappropriate|harassment|other"
}
```

### Get Comment Replies
```
GET /comments/:id/replies?page=number&limit=number&sort=recent|most_liked|oldest
```

### Get User Comments
```
GET /comments/user/:userId?page=number&limit=number
```

---

## Response Formats

### Success Response
```json
{
  "data": "response data",
  "message": "success message"
}
```

### Error Response
```json
{
  "error": "error message"
}
```

### Paginated Response
```json
{
  "data": ["array of items"],
  "totalPages": "number",
  "currentPage": "number",
  "total": "number"
}
```

---

## Rant Model Fields

### Core Fields
- `text` (required): The main content of the rant
- `title` (optional): A title for the rant
- `author` (required): Reference to the user who created the rant
- `location` (required): Location information including city, coordinates, etc.

### Engagement Metrics
- `likes`: Number of likes
- `likedBy`: Array of user IDs who liked the rant
- `dislikes`: Number of dislikes
- `dislikedBy`: Array of user IDs who disliked the rant
- `commentCount`: Number of comments
- `viewCount`: Number of views
- `shareCount`: Number of shares
- `bookmarkCount`: Number of bookmarks
- `bookmarkedBy`: Array of user IDs who bookmarked the rant

### Categorization
- `category`: Type of issue (infrastructure, transportation, etc.)
- `priority`: Priority level (low, medium, high, urgent)
- `status`: Current status (active, resolved, in_progress, escalated, closed)
- `tags`: Array of tags for categorization

### Escalation & Resolution
- `escalationThreshold`: Number of likes needed for escalation
- `isEscalated`: Whether the rant has been escalated
- `escalatedAt`: When the rant was escalated
- `escalatedTo`: Information about where it was escalated
- `resolution`: Resolution details including status and feedback

### Moderation
- `isAnonymous`: Whether the rant was posted anonymously
- `isEdited`: Whether the rant has been edited
- `isDeleted`: Whether the rant has been deleted (soft delete)
- `reportCount`: Number of reports
- `reportedBy`: Array of report details
- `isModerated`: Whether the rant has been moderated

### Analytics
- `sentiment`: Sentiment analysis (positive, negative, neutral)
- `trendingScore`: Calculated trending score
- `hotScore`: Calculated hot score
- `engagementRate`: Engagement rate percentage

---

## Comment Model Fields

### Core Fields
- `text` (required): The comment content
- `author` (required): Reference to the user who created the comment
- `rant` (required): Reference to the rant this comment belongs to
- `parentComment` (optional): Reference to parent comment for replies

### Engagement Metrics
- `likes`: Number of likes
- `likedBy`: Array of user IDs who liked the comment
- `dislikes`: Number of dislikes
- `dislikedBy`: Array of user IDs who disliked the comment
- `engagement`: Object containing views, shares, bookmarks

### Moderation
- `isEdited`: Whether the comment has been edited
- `isDeleted`: Whether the comment has been deleted (soft delete)
- `reportCount`: Number of reports
- `reportedBy`: Array of report details

### Additional Features
- `tags`: Array of tags
- `mentions`: Array of mentioned users
- `attachments`: Array of file attachments
- `location`: Location information
- `isAnonymous`: Whether the comment was posted anonymously
- `sentiment`: Sentiment analysis

---

## Features Overview

### Rant Features
1. **Comprehensive Content**: Support for text, images, attachments, and rich metadata
2. **Location-based**: Full location tracking with coordinates and address
3. **Categorization**: Categories, priorities, tags, and status tracking
4. **Engagement**: Likes, dislikes, comments, views, shares, bookmarks
5. **Escalation**: Automatic escalation based on engagement thresholds
6. **Moderation**: Reporting, soft deletion, and moderation tools
7. **Analytics**: Trending scores, hot scores, and engagement metrics
8. **Search & Filter**: Advanced search and filtering capabilities

### Comment Features
1. **Nested Comments**: Support for replies and threaded discussions
2. **Rich Content**: Text, tags, mentions, and attachments
3. **Engagement**: Likes, dislikes, and engagement tracking
4. **Moderation**: Reporting and soft deletion
5. **Location**: Optional location tracking
6. **Anonymous Posting**: Support for anonymous comments

### User Features
1. **Enhanced Profiles**: Comprehensive user profiles with rich metadata
2. **Gamification**: Points, levels, experience, and badges
3. **Activity Tracking**: Total rants, comments, upvotes, and engagement metrics
4. **Social Features**: Followers, following, and social connections
5. **Preferences**: Notification settings, privacy controls, and theme preferences

### Technical Features
1. **Performance**: Optimized indexes for fast queries
2. **Scalability**: Efficient data structures and query patterns
3. **Security**: JWT authentication and authorization
4. **Error Handling**: Comprehensive error handling and validation
5. **Logging**: Detailed logging for debugging and monitoring 