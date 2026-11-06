# carwinn.ing

Personal portfolio site: Home, Projects (merged, tag-filterable), and Experience.

## Structure

- `index.html` — home page: photo, bio, contact card, photo gallery
- `projects.html` — all projects in one filterable grid, with a modal for each
- `resume.html` — embedded resume PDF viewer + an editable timeline
- `assets/css/styles.css` — all styling
- `assets/js/scripts.js` — loads project/timeline data, builds the grid, filters, and modal
- `assets/data/projects.json` — every project's title, description, images, tags, and ongoing status
- `assets/data/timeline.json` — timeline entries for the Experience page
- `assets/images/`, `assets/docs/resume.pdf` — bring these over from your current site, same paths

## Adding or editing a project

Open `assets/data/projects.json`. Each project looks like:

```json
"ProjectId": {
  "id": "ProjectId",
  "title": "Project Name",
  "tags": ["Welding", "CAD", "Electronics"],
  "ongoing": true,
  "thumb": "assets/images/.../thumb.jpg",
  "images": ["assets/images/.../1.jpg", "..."],
  "description": "...",
  "videos": ["https://youtube.com/watch?v=..."]
}
```

- Add the new id to `projectOrder` at the top of the file so it shows up.
- `tags` can be any words you want (Welding, CAD, Electronics, Programming, 3D Printing, Glasswork, Machining, ...). The filter bar on the Projects page builds itself automatically from whatever tags exist in the data — no need to touch the filter bar by hand.
- Set `ongoing: true` for anything still in progress; it gets an "Ongoing" badge and shows up under the Ongoing filter.
- `videos` is optional.

I tagged the projects based on what your existing project descriptions said (welded frame → Welding, "entirely 3D printed" → 3D Printing, etc.). Worth a quick skim before the fair to make sure every tag is accurate, especially "Programming" and "Electronics" on a couple of the robots — I inferred those from context but you may want to swap them for exactly what you did.

## Adding a timeline entry

Open `assets/data/timeline.json` and add an object in the same shape as the others — `start`, `end`, `ongoing`, `title`, `org`, `description`. This is the place for anything that doesn't fit on the one-page resume: older jobs, awards, smaller roles, etc. It's sorted in the order you list it (currently most-recent-first, matching the resume).

## Before you deploy

- Copy your real `assets/images/`, `assets/docs/resume.pdf`, and `assets/images/profile.jpg` into this folder structure — none of the actual image files were part of what you sent me, so the pages will show broken images until those are in place.
- Delete the old `smart-juice.html` and `creative-juice.html` from your live site (or redirect them to `projects.html`) once this is live, and update the LinkedIn/resume links if you reference the old page names anywhere.
