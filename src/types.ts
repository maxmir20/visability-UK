
type MatchResults = {
    exactMatches: string[]
    nearExactMatches: string[]
    partialMatches: string[]
}

type MatchStatus = "exact" | "nearExact" | "partial" | "none"

type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HEX = `#${string}`

type Color = RGB | RGBA | HEX

type BadgeConfig = {
    color: Color
    text: string
}

type UpdateBadge = {
    action: "updateBadge"
    color: Color
    text: string
}
type ClearBadge = {
    action: "clearBadge"
    text: string
}
type GetCurrentResults = {
    action: "getCurrentResults"
}

type ActionMessage = UpdateBadge | ClearBadge | GetCurrentResults