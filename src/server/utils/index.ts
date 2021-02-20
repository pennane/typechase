export const randomFromArray = (arr: any[]): any => arr[(arr.length * Math.random()) | 0]

export const randomFromRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
