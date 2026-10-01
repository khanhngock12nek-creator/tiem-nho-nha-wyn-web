# Security Specification - Tiệm Nhỏ Nhà Wyn

## Data Invariants
- A `CharacterComment` must belong to an existing `Character`.
- A `PuzzleImage` must belong to an existing `Character`.
- `SiteConfig` is a singleton with ID 'main'.
- Only the site owner (identified by email or admin document) should have full write access to characters and site config.
- Regular users can create comments and sticky notes, but cannot modify others' data.

## The "Dirty Dozen" Payloads (Identity, Integrity, and State violations)

1. **Identity Spoofing (Comments)**: Create a comment with a `userId` that does not match the authenticated user.
2. **Resource Poisoning (Character ID)**: Attempt to create a character with an ID longer than 128 characters or containing illegal characters.
3. **Ghost Field Injection (Character)**: Update a character and include `isAdminPrivilege: true`.
4. **State Shortcutting (Likes)**: Manually set a character's `likes` to a massive number without a legitimate like action.
5. **PII Blanket Leak (User Data)**: Attempt to list all documents in a hypothetical user collection (if added later).
6. **Query Scraping (Comments)**: List all comments without filtering by `characterId` (if rules were supposed to enforce it).
7. **Unauthorized Write (Site Config)**: A regular user attempting to change the `backgroundUrl`.
8. **Unauthorized Write (Character)**: A regular user attempting to delete or modify a character.
9. **Orphaned Record (Comment)**: Create a comment for a `characterId` that does not exist.
10. **Timestamp Spoofing**: Provide a future `createdAt` timestamp instead of using `request.time`.
11. **ID Poisoning (Path)**: Attempt to access a path like `characters/..%2F..%2Fsys_config`.
12. **Massive Payload (Puzzle Image)**: Upload a `imageUrl` that exceeds the size limit.

## Test Runner Plan
- [x] Verify `isValidId()` blocks junk IDs.
- [x] Verify `isValidCharacter()` enforces strict schema (including `views`).
- [x] Verify `site_config/main` is readable by all but writeable only by admin.
- [x] Verify `character_comments` is writeable only by authenticated users for their own comments.
- [x] Verify `characters` updates (likes/views) are permitted for users, but full edits are admin-only.

## Admin Definition
Admin identified by email: `khanhngock12nek@gmail.com` (from additional metadata).
