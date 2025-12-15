import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatPrice(price: string) {
  return `${parseFloat(price).toFixed(2)} MATIC`
}

export function truncateText(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}