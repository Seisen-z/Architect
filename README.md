# NGC Architecture Showcase

An interactive presentation of the New Government Center proposal for E. B. Magalona, designed by Erica Mae D. Pancho with academic adviser Ar. Gary Peter L. Bello, UAP.

The website uses Next.js 14, React, TypeScript, Tailwind CSS, and Three.js. Its coastal palette combines sand, sea glass, teal, and deep blue.

## Explore the proposal

- Rotate, zoom, and separate the three-dimensional building model.
- Select a floor and room to inspect partitions, doors, desks, chairs, and meeting tables.
- Explore the site layout, access roads, parking, trees, and auxiliary buildings.
- Switch to the editable two-dimensional floor diagram.
- Inspect four elevation drawings and two building sections with zoom, panning, and detail focus.
- Browse site areas, construction phases, the design process, and material specifications.

The model is a presentation interpretation of the architectural drawings. Furniture forms, finishes, vehicles, and auxiliary building heights are schematic. It is not a construction or BIM deliverable.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build` followed by `npm start`.

## Source layout

- `lib/buildingPlan.json` contains extracted floor outlines, walls, object locations, and room labels.
- `lib/buildingGeometry.ts`, `lib/buildingDetails.ts`, `lib/planInteriors.ts`, and `lib/siteModel.ts` construct the model.
- `lib/elevationDrawings.ts` supplies the drawing viewer's descriptions and detail points.
- `lib/siteData.ts` supplies the editable diagram and other project content.
- `public/drawings/` holds the presentation drawings.
- `app/globals.css` and `tailwind.config.ts` define the visual theme.

Local environment files, dependencies, and generated build output are excluded from Git. The full source PDF is not required at runtime. The drawing assets retain the original project attribution.

## License

MIT, as specified by the existing project.
