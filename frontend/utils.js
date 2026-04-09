export function lerp(origin, destination, time) {
    return origin + (destination - origin) * time;
}