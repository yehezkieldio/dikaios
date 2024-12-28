import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { uuidv7 } from "uuidv7";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function randomId() {
    return uuidv7();
}
