import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CommitteeValidator, ValidationResult } from '@/lib/committee-validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface CommitteeInputProps {
  /** Current committee value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string, normalizedValue?: string) => void;
  /** Whether this field is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show validation feedback */
  showValidation?: boolean;
}

/**
 * CommitteeInput component with real-time validation and user guidance
 *
 * Features:
 * - Real-time validation as user types
 * - Visual feedback for valid/invalid states
 * - Suggestions for invalid inputs
 * - Examples of valid formats
 * - Automatic normalization to ALL CAPS
 */
export default function CommitteeInput({
  value,
  onChange,
  required = false,
  className,
  placeholder = "Enter committee name",
  showValidation = true
}: CommitteeInputProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (value.trim()) {
      const result = CommitteeValidator.validateCommitteeName(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const result = CommitteeValidator.validateCommitteeName(newValue);

    // Call onChange with both raw value and normalized value if valid
    onChange(newValue, result.isValid ? result.normalizedName : undefined);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion, suggestion);
  };

  const getInputClassName = () => {
    if (!showValidation || !validation) return '';

    if (validation.isValid) {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    } else {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    }
  };

  const getValidationIcon = () => {
    if (!showValidation || !validation) return null;

    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Label htmlFor="committee-input" className="text-sm font-medium">
          Committee {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative mt-1">
          <Input
            id="committee-input"
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "pr-10 transition-colors",
              getInputClassName(),
              className
            )}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getValidationIcon()}
          </div>
        </div>
      </div>

      {/* Validation Feedback */}
      {showValidation && validation && (
        <div className="space-y-2">
          {validation.isValid ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Valid committee name. Will be saved as: <strong>{validation.normalizedName}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validation.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lightbulb className="w-4 h-4" />
                <span>Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {validation.suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Examples - Show when focused or when there's an error */}
      {(isFocused || (validation && !validation.isValid)) && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Valid formats:</strong>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {CommitteeValidator.getValidExamples().map((example, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {example}
                </code>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600 mt-2">
            <strong>Invalid examples:</strong>
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm text-red-600">
            {CommitteeValidator.getInvalidExamples().map((example, index) => (
              <div key={index} className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span className="line-through">{example}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
