const onlinePets = new Map<number, string>();

export function addOnlinePet(petId: number, socketId: string) {
    onlinePets.set(petId, socketId);
}

export function removeOnlinePet(petId: number) {
    onlinePets.delete(petId);
}

export function isPetOnline(petId: number): boolean {
    return onlinePets.has(petId);
}

export function getOnlinePetIds(): number[] {
    return Array.from(onlinePets.keys());
}
