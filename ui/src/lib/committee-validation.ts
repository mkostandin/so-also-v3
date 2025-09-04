/**
 * Committee name validation utilities for frontend
 * Mirrors server-side validation for consistent user experience
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedName?: string;
  error?: string;
  suggestions?: string[];
}

// Valid committee patterns
export const REGIONAL_PATTERN = /^[A-Z]+YPAA$/;
export const ADVISORY_PATTERN = /^[A-Z]+YPAA ADVISORY$/;
export const BID_PATTERN = /^[A-Z\s]+BID FOR Y?PAA$/;

// Common committee names
export const VALID_COMMITTEES = [
  'NECYPAA',
  'MSCYPAA',
  'RISCYPAA',
  'NHSCYPAA',
  'CSCYPAA',
  'VTCYPAA',
  'MECYPAA',
  'NECYPAA ADVISORY',
  'MSCYPAA ADVISORY',
  'RISCYPAA ADVISORY',
  'NHSCYPAA ADVISORY',
  'CSCYPAA ADVISORY',
  'VTCYPAA ADVISORY',
  'MECYPAA ADVISORY',
  'RHODE ISLAND BID FOR NECYPAA',
  'MASSACHUSETTS BID FOR MSCYPAA',
  'CONNECTICUT BID FOR CSCYPAA',
  'NEW HAMPSHIRE BID FOR NHSCYPAA',
  'VERMONT BID FOR VTCYPAA',
  'MAINE BID FOR MECYPAA'
];

// Invalid patterns to reject
export const INVALID_PATTERNS = [
  /EXECUTIVE/i,      // "NECYPAA EXECUTIVE"
  /THE NEW HAMPSHIRE CONFERENCE/i,  // Long descriptive names
  /THE /i            // Leading "THE" (should be removed)
];

export class CommitteeValidator {
  /**
   * Validate a committee name and provide suggestions
   */
  static validateCommitteeName(name: string): ValidationResult {
    if (!name || !name.trim()) {
      return {
        isValid: false,
        error: 'Committee name is required'
      };
    }

    const trimmedName = name.trim();

    // Check for invalid patterns
    for (const pattern of INVALID_PATTERNS) {
      if (pattern.test(trimmedName)) {
        return {
          isValid: false,
          error: this.getErrorForInvalidPattern(trimmedName),
          suggestions: this.getSuggestionsForInvalidName(trimmedName)
        };
      }
    }

    // Check if it's already a valid committee name
    if (VALID_COMMITTEES.includes(trimmedName.toUpperCase())) {
      return {
        isValid: true,
        normalizedName: trimmedName.toUpperCase()
      };
    }

    // Try to normalize and validate
    const normalized = this.normalizeCommitteeName(trimmedName);

    if (this.isValidPattern(normalized)) {
      return {
        isValid: true,
        normalizedName: normalized
      };
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(trimmedName);

    return {
      isValid: false,
      error: 'Invalid committee name format',
      suggestions: suggestions
    };
  }

  /**
   * Normalize a committee name to ALL CAPS and remove leading "THE"
   */
  static normalizeCommitteeName(name: string): string {
    return name
      .replace(/^THE\s+/i, '')  // Remove leading "THE"
      .toUpperCase()            // Convert to ALL CAPS
      .trim();                  // Remove whitespace
  }

  /**
   * Check if a normalized name matches valid patterns
   */
  static isValidPattern(normalizedName: string): boolean {
    return REGIONAL_PATTERN.test(normalizedName) ||
           ADVISORY_PATTERN.test(normalizedName) ||
           BID_PATTERN.test(normalizedName);
  }

  /**
   * Get error message for invalid patterns
   */
  private static getErrorForInvalidPattern(name: string): string {
    if (/EXECUTIVE/i.test(name)) {
      return 'Committee names cannot contain "EXECUTIVE". Use regional names like "NECYPAA" instead.';
    }
    if (/THE NEW HAMPSHIRE CONFERENCE/i.test(name)) {
      return 'Committee names should be short. Use "NHSCYPAA" instead of long descriptive names.';
    }
    if (/^THE /i.test(name)) {
      return 'Remove "THE" from the beginning of committee names.';
    }
    return 'Invalid committee name format.';
  }

  /**
   * Generate suggestions for invalid names
   */
  private static getSuggestionsForInvalidName(name: string): string[] {
    const suggestions: string[] = [];

    if (/EXECUTIVE/i.test(name)) {
      // Suggest regional version
      const regionalMatch = name.match(/^([A-Z]+)YPAA/i);
      if (regionalMatch) {
        suggestions.push(regionalMatch[1] + 'YPAA');
      }
    }

    if (/THE NEW HAMPSHIRE CONFERENCE/i.test(name)) {
      suggestions.push('NHSCYPAA');
    }

    if (/^THE (.+)/i.test(name)) {
      const withoutThe = this.normalizeCommitteeName(name);
      if (this.isValidPattern(withoutThe)) {
        suggestions.push(withoutThe);
      }
    }

    // Add some general suggestions
    if (suggestions.length === 0) {
      suggestions.push('NECYPAA', 'MSCYPAA', 'RISCYPAA', 'NHSCYPAA');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Generate suggestions for any invalid name
   */
  private static generateSuggestions(name: string): string[] {
    const suggestions: string[] = [];
    const normalized = this.normalizeCommitteeName(name);

    // Try to find similar valid committees
    const similar = VALID_COMMITTEES.filter(committees =>
      committees.includes(normalized.substring(0, 3)) ||
      normalized.includes(committees.substring(0, 3))
    );

    suggestions.push(...similar);

    // Add some standard examples
    if (suggestions.length === 0) {
      suggestions.push('NECYPAA', 'NECYPAA ADVISORY', 'RHODE ISLAND BID FOR NECYPAA');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get examples of valid committee names
   */
  static getValidExamples(): string[] {
    return [
      'NECYPAA',                    // Regional
      'NECYPAA ADVISORY',          // Advisory
      'RHODE ISLAND BID FOR NECYPAA' // BID
    ];
  }

  /**
   * Get examples of invalid committee names
   */
  static getInvalidExamples(): string[] {
    return [
      'NECYPAA EXECUTIVE',         // Contains EXECUTIVE
      'THE NEW HAMPSHIRE CONFERENCE OF YOUNG PEOPLE IN AA', // Too long
      'THE NECYPAA'               // Has leading THE
    ];
  }
}
