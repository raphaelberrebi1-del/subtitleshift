# SubtitleShift Test Files

This directory contains sample SRT files for testing all features of SubtitleShift.

## Test Files Overview

### 1. `1-basic-test.srt`
**Purpose**: Quick feature testing
- 5 simple subtitles
- Clean, properly formatted
- Good for initial testing

**How to use**:
1. Upload this file first
2. Verify file parsing works
3. Test basic editing features
4. Export and re-import to verify format

---

### 2. `2-timing-test.srt`
**Purpose**: Test the timestamp shifter (killer feature!)
- 10 subtitles that are 2 seconds too late
- Perfect for testing timing adjustments

**How to use**:
1. Upload the file
2. Try the timestamp shifter with `-2` seconds
3. Verify all timestamps shift correctly
4. Test preview feature before applying
5. Test with positive offsets too

**Expected result**: After shifting by -2s, first subtitle should start at 00:00:01,000

---

### 3. `3-long-text.srt`
**Purpose**: Test character count warnings
- 8 subtitles with varying text lengths
- Some exceed 50 characters (should trigger warnings)
- Multi-line subtitles included

**How to use**:
1. Upload the file
2. Look for yellow warning indicators
3. Click Edit on a long subtitle
4. See character count per line
5. Test editing to fix long lines

**Expected result**: Subtitles 2, 4, and 6 should show character warnings

---

### 4. `4-typo-test.srt`
**Purpose**: Test find & replace functionality
- 12 subtitles with repeated typo: "teh" instead of "the"
- Tests case-sensitive and case-insensitive search

**How to use**:
1. Upload the file
2. Open Find & Replace tool
3. Find: "teh"
4. Replace: "the"
5. Click "Replace All"
6. Verify match counter shows 11 matches
7. Test case-sensitive toggle

**Expected result**: Should find and replace 11 occurrences of "teh"

---

### 5. `5-demo-video.srt`
**Purpose**: Demo and presentation content
- 15 subtitles with realistic video script
- Professional content about SubtitleShift
- Great for screenshots and demos

**How to use**:
1. Use for Product Hunt demo video
2. Take screenshots for landing page
3. Show complete workflow in action
4. Perfect for social media content

---

### 6. `6-large-file.srt`
**Purpose**: Performance and stress testing
- 100 subtitles spanning ~5 minutes
- Tests scrolling performance with larger datasets
- Tests export speed with substantial files
- Validates memory management

**How to use**:
1. Upload to test performance with larger files
2. Scroll through the entire subtitle list
3. Test find & replace on many entries (try "the" or "performance")
4. Test timestamp shift on all 100 entries
5. Measure export time - should be instant
6. Monitor browser memory in DevTools

**Expected result**: App should remain perfectly responsive, no lag during scroll, editing, or export

---

## Testing Workflow

### Complete Feature Test (15 minutes)

1. **File Upload Test**
   - Drag and drop `1-basic-test.srt`
   - Verify it parses correctly
   - Check subtitle count is correct

2. **Timestamp Shifter Test**
   - Upload `2-timing-test.srt`
   - Shift by -2 seconds
   - Verify preview shows correct changes
   - Apply and check first subtitle starts at 00:00:01,000

3. **Text Editor Test**
   - Upload `1-basic-test.srt`
   - Click any subtitle to edit
   - Change text
   - Press Enter to save
   - Verify changes persist

4. **Find & Replace Test**
   - Upload `4-typo-test.srt`
   - Find "teh", replace with "the"
   - Verify 11 matches found
   - Click "Replace All"
   - Check all instances are fixed

5. **Export Test**
   - After making changes, click Export
   - Download the file
   - Re-upload to verify changes were saved
   - Check file format is correct

6. **Character Warning Test**
   - Upload `3-long-text.srt`
   - Look for yellow warning indicators
   - Edit a long subtitle
   - See character count warnings

7. **Performance Test**
   - Upload `6-large-file.srt`
   - Scroll through list
   - Test all features with larger file
   - Verify responsiveness

---

## Creating Your Own Test Files

### SRT Format Basics

```
1
00:00:01,000 --> 00:00:03,000
Your subtitle text here

2
00:00:04,000 --> 00:00:06,500
Second subtitle text
```

**Format Rules**:
- Sequential numbering (1, 2, 3...)
- Timestamps: `HH:MM:SS,mmm --> HH:MM:SS,mmm`
- Use comma (`,`) for milliseconds, not period
- Blank line between entries
- UTF-8 encoding

---

## Troubleshooting

**File won't upload?**
- Check file extension is `.srt`
- Verify file size is under 50MB
- Make sure format follows SRT standard

**Timestamps not working?**
- Ensure using comma (`,`) not period (`.`) for milliseconds
- Verify timestamps are in order
- Check no negative timestamps

**Text not displaying?**
- Check UTF-8 encoding
- Verify no special characters causing issues
- Look for blank lines between entries

---

## Next Steps

After testing with these files:
1. Test with your own real subtitle files
2. Try edge cases (very large files, special characters)
3. Report any bugs or issues
4. Share feedback on features

Happy testing! 🎉
