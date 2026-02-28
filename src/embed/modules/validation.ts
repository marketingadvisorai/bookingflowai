export function isValidEmailOrEmpty(s: string): boolean {
  if (!s) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(s);
}

export function isValidEmail(s: string): boolean {
  if (!s) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(s);
}

export function isValidPhone(s: string): boolean {
  if (!s) return true; // Optional field
  const digitsOnly = s.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

export function validateCustomerData(name: string, email: string, phone?: string): string[] {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Name is required');
  }
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (phone && !isValidPhone(phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return errors;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>&"']/g, '');
}