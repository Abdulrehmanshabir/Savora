import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  // If it's a Firestore Timestamp
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  
  const serialized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      serialized[key] = serializeData(data[key]);
    }
  }
  return serialized;
}
