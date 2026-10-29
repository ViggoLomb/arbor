export const projectCenter: [number, number] = [
  -59.141238053426, -37.334070840257,
]
export const projectBounds: [[number, number], [number, number]] = [
  [-59.14242705784111, -37.33581580847755],
  [-59.13963036467105, -37.3335887759784],
]
const radians = Math.PI / 180
export const studyAreaHa = Number(
  (
    (6371008.8 ** 2 *
      (projectBounds[1][0] - projectBounds[0][0]) *
      radians *
      (Math.sin(projectBounds[1][1] * radians) -
        Math.sin(projectBounds[0][1] * radians))) /
    10000
  ).toFixed(1),
)
