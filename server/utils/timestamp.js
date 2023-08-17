export default function timestamped(string) {
    const date = new Date().toISOString();
    return '[' + date + '] ' + string;
}