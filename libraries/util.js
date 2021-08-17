export function wait(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000));
}