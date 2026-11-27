export const elevationDrawings = [
  {
    id: 'front', label: 'Front elevation', sheet: 'A06', width: 1450, height: 335,
    description: 'The front drawing shows the two office wings around the open courtyard and circular gathering hall. The raised entrance, steps, and access ramp can be read together with the window bays and roof line.',
    details: [
      { title: 'Circular hall and canopy', text: 'The curved canopy sits between the wings, with the open gathering area below.', x: 57, y: 43 },
      { title: 'Office window bays', text: 'Tall glazed bays and vertical piers give the front wings their repeated rhythm.', x: 32, y: 48 },
      { title: 'Raised public entrance', text: 'Steps and the ramp connect the forecourt to the entrance platform.', x: 64, y: 65 },
    ],
  },
  {
    id: 'rear', label: 'Rear elevation', sheet: 'A07', width: 1430, height: 315,
    description: 'The rear drawing shows the long building face, repeated arched openings, and the opening toward the planted courtyard. Structural grid bubbles and level markers remain visible for reference.',
    details: [
      { title: 'Repeated arched windows', text: 'Grouped openings mark the ground and second-floor office bays.', x: 27, y: 57 },
      { title: 'Courtyard opening', text: 'The central opening reveals planting between the two wings.', x: 51, y: 64 },
      { title: 'Continuous roof line', text: 'The parapet follows the full width of the rear elevation.', x: 63, y: 34 },
    ],
  },
  {
    id: 'left', label: 'Left side', sheet: 'A06', width: 1050, height: 365,
    description: 'The left side shows the building depth, the different window arrangements on each level, and the projecting entrance canopy. The original level and height dimensions are included beside the drawing.',
    details: [
      { title: 'Arched window openings', text: 'The drawn openings vary by floor rather than repeating one generic window pattern.', x: 57, y: 51 },
      { title: 'Side entrance and ramp', text: 'The entrance platform and ramp are visible along the ground-floor line.', x: 58, y: 58 },
      { title: 'Canopy projection', text: 'The curved canopy projects beyond the main wall at the front of the building.', x: 35, y: 35 },
    ],
  },
  {
    id: 'right', label: 'Right side', sheet: 'A07', width: 1020, height: 330,
    description: 'The opposite side shows the entrance canopy at the right, a band of ground-floor windows, and the higher wall planes. Grid lines and dimension strings preserve the relationship to the floor plans.',
    details: [
      { title: 'Ground-floor windows', text: 'Arched windows run along the lower wall between the structural bays.', x: 54, y: 63 },
      { title: 'Side access', text: 'Steps and a ramp lead up to the raised ground floor.', x: 42, y: 68 },
      { title: 'Entrance canopy', text: 'The canopy and its supporting pier extend beyond the main building face.', x: 78, y: 45 },
    ],
  },
  {
    id: 'longitudinal', label: 'Longitudinal section', sheet: 'A08', width: 1440, height: 345,
    description: 'This cut along the building shows the rooms, furniture, stairs, and open courtyard together. It helps explain how the three occupied floors connect and where the open spaces interrupt the building volume.',
    details: [
      { title: 'Stairs between floors', text: 'The stair flights connect the three levels beside the office wings.', x: 30, y: 48 },
      { title: 'Rooms and furniture', text: 'Desks, tables, doors, and room partitions are visible in the original section.', x: 73, y: 60 },
      { title: 'Open courtyard', text: 'The planted opening sits between the wings and remains open above.', x: 52, y: 62 },
    ],
  },
  {
    id: 'cross', label: 'Cross section', sheet: 'A08', width: 1000, height: 335,
    description: 'The cross cut shows the building through its depth, including the central stair, floor slabs, rooms, and projecting canopy. The section makes the vertical arrangement easier to understand than an exterior view alone.',
    details: [
      { title: 'Central stair core', text: 'The stacked stair flights show how people move between floors.', x: 50, y: 46 },
      { title: 'Floor slabs and rooms', text: 'Three occupied levels are visible with their partitions and openings.', x: 62, y: 53 },
      { title: 'Canopy and entrance', text: 'The curved roof and supporting pier sit outside the main building volume.', x: 80, y: 47 },
    ],
  },
];
