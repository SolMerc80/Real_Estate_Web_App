
export function parseid(id: string) {
    const parsed = Number(id);

    if (isNaN(parsed)) {
        throw new Error("Invalid ID");
    }

    return parsed;
}